
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as readline from 'readline';
import * as path from 'path';
import * as zlib from 'zlib';

// --- CONFIGURATION ---
const BATCH_SIZE = 1000;
const MIN_VOTES = 100;
const DATA_DIR = path.join(process.cwd(), 'data');

// Load environment variables directly if running as a standalone script
// (Next.js loads them automatically, but this script might be run with ts-node)
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // MUST use Service Role key for bulk inserts

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    console.error('Note: Use the SERVICE_ROLE_KEY for ingestion to bypass RLS policies if necessary.');
    process.exit(1);
}

const db = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
});

// --- HELPER FUNCTIONS ---

const validTconsts = new Set<string>();

async function loadRatings() {
    console.log(`\n[1/3] Processing ratings (min votes: ${MIN_VOTES})...`);
    const filePath = path.join(DATA_DIR, 'title.ratings.tsv.gz');

    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}\nPlease run 'npm run download' first.`);
    }

    const fileStream = fs.createReadStream(filePath).pipe(zlib.createGunzip());
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let count = 0;
    let matches = 0;

    for await (const line of rl) {
        if (count === 0) { count++; continue; } // Skip header
        count++;

        // tconst	averageRating	numVotes
        const [tconst, avgRating, numVotesStr] = line.split('\t');
        const numVotes = parseInt(numVotesStr, 10);

        if (numVotes >= MIN_VOTES) {
            validTconsts.add(tconst);
            matches++;
        }
    }
    console.log(`      Found ${matches} movies with >= ${MIN_VOTES} votes.`);
}

async function ingestMoviesAndRatings() {
    console.log(`\n[2/3] Processing movies and inserting data...`);

    // We need to re-read ratings to insert them, or we could have stored them in memory.
    // To save memory, we'll read ratings file again in parallel or we can just store the rating data in a map.
    // Given 500MB limit, ~1M items is fine for Map.
    // Let's optimize: We'll read MOVIES first. If a movie matches our Set, we keep it.

    const moviesPath = path.join(DATA_DIR, 'title.basics.tsv.gz');
    if (!fs.existsSync(moviesPath)) {
        throw new Error(`File not found: ${moviesPath}`);
    }

    const movieStream = fs.createReadStream(moviesPath).pipe(zlib.createGunzip());
    const rlMovies = readline.createInterface({ input: movieStream, crlfDelay: Infinity });

    let moviesBuffer: any[] = [];
    let processedMovies = 0;
    let insertedMovies = 0;

    console.log('      Filtering content...');

    for await (const line of rlMovies) {
        if (processedMovies === 0) { processedMovies++; continue; }
        processedMovies++;

        // tconst	titleType	primaryTitle	originalTitle	isAdult	startYear	endYear	runtimeMinutes	genres
        const cols = line.split('\t');
        const tconst = cols[0];
        const titleType = cols[1];

        // Filter: Must be in our "popular" set AND be a 'movie'
        if (validTconsts.has(tconst) && titleType === 'movie') {

            const startYear = cols[5] === '\\N' ? null : parseInt(cols[5]);
            const runtimeMinutes = cols[7] === '\\N' ? null : parseInt(cols[7]);
            const limit = 10000; // sanity check for bad data

            moviesBuffer.push({
                tconst,
                titleType,
                primaryTitle: cols[2],
                originalTitle: cols[3],
                isAdult: cols[4] === '1',
                startYear: (startYear && startYear > 1800 && startYear < 2100) ? startYear : null,
                endYear: cols[6] === '\\N' ? null : parseInt(cols[6]),
                runtimeMinutes: (runtimeMinutes && runtimeMinutes > 0 && runtimeMinutes < limit) ? runtimeMinutes : null,
                genres: cols[8] === '\\N' ? [] : cols[8].split(',')
            });

            if (moviesBuffer.length >= BATCH_SIZE) {
                const { error } = await db.from('movies').upsert(moviesBuffer, { onConflict: 'tconst' });
                if (error) {
                    console.error('CRITICAL: Error inserting movies batch:', error);
                    throw error; // Fail fast
                }
                insertedMovies += moviesBuffer.length;
                process.stdout.write(`\r      Inserted ${insertedMovies} movies...`);
                moviesBuffer = [];
            }
        } else {
            // If it's not a movie or doesn't have enough votes, remove it from valid list so we don't insert its rating
            validTconsts.delete(tconst);
        }
    }

    // Flush remaining movies
    if (moviesBuffer.length > 0) {
        await db.from('movies').upsert(moviesBuffer, { onConflict: 'tconst' });
        insertedMovies += moviesBuffer.length;
    }
    console.log(`\n      Finished inserting ${insertedMovies} movies.`);

    // Now insert Ratings for the Valid Movies
    console.log(`\n[3/3] Inserting ratings for valid movies...`);
    const ratingsPath = path.join(DATA_DIR, 'title.ratings.tsv.gz');
    const ratingsStream = fs.createReadStream(ratingsPath).pipe(zlib.createGunzip());
    const rlRatings = readline.createInterface({ input: ratingsStream, crlfDelay: Infinity });

    let ratingsBuffer: any[] = [];
    let insertedRatings = 0;
    let headerSkipped = false;

    for await (const line of rlRatings) {
        if (!headerSkipped) { headerSkipped = true; continue; }

        const [tconst, averageRating, numVotes] = line.split('\t');

        // Only insert if this tconst ended up being a valid movie we inserted
        if (validTconsts.has(tconst)) {
            ratingsBuffer.push({
                tconst,
                averageRating: parseFloat(averageRating),
                numVotes: parseInt(numVotes)
            });

            if (ratingsBuffer.length >= BATCH_SIZE) {
                const { error } = await db.from('ratings').upsert(ratingsBuffer, { onConflict: 'tconst' });
                if (error) {
                    console.error('CRITICAL: Error inserting ratings batch:', error);
                    throw error;
                }
                insertedRatings += ratingsBuffer.length;
                process.stdout.write(`\r      Inserted ${insertedRatings} ratings...`);
                ratingsBuffer = [];
            }
        }
    }

    // Flush remaining ratings
    if (ratingsBuffer.length > 0) {
        await db.from('ratings').upsert(ratingsBuffer);
        insertedRatings += ratingsBuffer.length;
    }
    console.log(`\n      Finished inserting ${insertedRatings} ratings.`);
}

// MAIN EXECUTION
(async () => {
    try {
        await loadRatings();
        await ingestMoviesAndRatings();
        console.log('\nSuccess! Data ingestion complete.');
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();

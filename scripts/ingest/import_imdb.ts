
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as readline from 'readline';
import * as path from 'path';
import * as zlib from 'zlib';

// --- CONFIGURATION ---
const BATCH_SIZE = 1000;
const MIN_VOTES = 100;
const DATA_DIR = path.join(process.cwd(), 'data');

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase keys.');
    process.exit(1);
}

const db = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
});

// --- STATE ---
const validTconsts = new Set<string>(); // Movies with enough votes
const moviesStore = new Map<string, any>(); // tconst -> { title, year, directorNconst, genreNames[] }
const neededNconsts = new Set<string>(); // People we need names for
const nameMap = new Map<string, string>(); // nconst -> name
const starRelations: { movieId: string; starId: string }[] = [];
// genre map: name -> id (we will generate numeric IDs)
let genreMap = new Map<string, number>();

// --- HELPERS ---
function getStream(filename: string) {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) throw new Error(`File missing: ${filename}`);
    return readline.createInterface({
        input: fs.createReadStream(filePath).pipe(zlib.createGunzip()),
        crlfDelay: Infinity
    });
}

async function run() {
    try {
        // 1. Scan RATINGS -> Identify valid movies
        console.log('[1/5] Scanning Ratings...');
        const rlRatings = getStream('title.ratings.tsv.gz');
        let count = 0;
        for await (const line of rlRatings) {
            if (count++ === 0) continue;
            const [tconst, avgRating, numVotes] = line.split('\t');
            if (parseInt(numVotes) >= MIN_VOTES) {
                validTconsts.add(tconst);
            }
        }
        console.log(`      Found ${validTconsts.size} valid movies.`);

        // 2. Scan BASICS -> Get metadata & genres
        console.log('[2/5] Scanning Movie Basics...');
        const rlBasics = getStream('title.basics.tsv.gz');
        count = 0;
        for await (const line of rlBasics) {
            if (count++ === 0) continue;
            const cols = line.split('\t');
            const tconst = cols[0];

            const startYear = cols[5] === '\\N' ? null : parseInt(cols[5]);

            // FILTER: Must be 'movie', have enough votes, AND valid YEAR
            if (validTconsts.has(tconst) && cols[1] === 'movie' && startYear !== null) {
                const primaryTitle = cols[2];
                const genres = cols[8] === '\\N' ? [] : cols[8].split(',');

                // Store partial movie data
                moviesStore.set(tconst, {
                    id: tconst,
                    title: primaryTitle,
                    year: startYear,
                    directorNconst: null, // fill later
                    genres: genres
                });
            } else {
                validTconsts.delete(tconst); // Remove if filtered out
            }
        }
        console.log(`      Filtered to ${moviesStore.size} actual movies.`);

        // 3. Scan CREW -> Get Director ID
        console.log('[3/5] Scanning Directors...');
        const rlCrew = getStream('title.crew.tsv.gz');
        count = 0;
        for await (const line of rlCrew) {
            if (count++ === 0) continue;
            const [tconst, directors] = line.split('\t');

            if (moviesStore.has(tconst) && directors !== '\\N') {
                // Take first director
                const directorId = directors.split(',')[0];
                moviesStore.get(tconst).directorNconst = directorId;
                neededNconsts.add(directorId);
            }
        }

        // 4. Scan PRINCIPALS -> Get Actor IDs
        console.log('[4/5] Scanning Actors (Principals)...');
        const rlPrincipals = getStream('title.principals.tsv.gz');
        count = 0;
        for await (const line of rlPrincipals) {
            if (count++ === 0) continue;
            const cols = line.split('\t');
            const tconst = cols[0];
            const nconst = cols[2];
            const category = cols[3];

            if (moviesStore.has(tconst) && (category === 'actor' || category === 'actress')) {
                neededNconsts.add(nconst);
                starRelations.push({ movieId: tconst, starId: nconst });
            }
        }
        console.log(`      Need to resolve ${neededNconsts.size} names.`);

        // 5. Scan NAMES -> Resolve IDs to Strings
        console.log('[5/5] Resolving Names...');
        const rlNames = getStream('name.basics.tsv.gz');
        count = 0;
        for await (const line of rlNames) {
            if (count++ === 0) continue;
            const cols = line.split('\t');
            const nconst = cols[0];

            if (neededNconsts.has(nconst)) {
                const name = cols[1];
                nameMap.set(nconst, name);
            }
        }

        // --- INSERTION PHASE ---
        console.log('\n--- INSERTING DATA ---');

        // A. Insert STARS
        console.log(`Inserting ${neededNconsts.size} Stars...`);
        const rlNames2 = getStream('name.basics.tsv.gz');
        let starsBatch: any[] = [];
        count = 0;
        let insertedStars = 0;
        const foundStars = new Set<string>(); // TRACK FOUND STARS

        for await (const line of rlNames2) {
            if (count++ === 0) continue;
            const cols = line.split('\t');
            const nconst = cols[0];
            if (neededNconsts.has(nconst)) {
                starsBatch.push({
                    id: nconst,
                    name: cols[1],
                    birthYear: cols[2] === '\\N' ? null : parseInt(cols[2])
                });
                foundStars.add(nconst);

                if (starsBatch.length >= BATCH_SIZE) {
                    const { error } = await db.from('stars').upsert(starsBatch, { onConflict: 'id' });
                    if (error && error.code !== '23505') { console.error('Star Err', error); throw error; }
                    insertedStars += starsBatch.length;
                    process.stdout.write(`\rStars: ${insertedStars}`);
                    starsBatch = [];
                }
            }
        }
        if (starsBatch.length > 0) {
            await db.from('stars').upsert(starsBatch, { onConflict: 'id' });
        }
        console.log(`\nStars inserted. Found ${foundStars.size} matching stars.`);

        // B. Insert GENRES
        console.log('Inserting Genres...');
        const uniqueGenres = new Set<string>();
        moviesStore.forEach(m => m.genres.forEach((g: string) => uniqueGenres.add(g)));

        // 1. Get existing genres
        const { data: existingGenres, error: gFetchErr } = await db.from('genres').select('id, name');
        if (gFetchErr) throw gFetchErr;
        existingGenres?.forEach(g => genreMap.set(g.name, g.id));

        // 2. Insert new genres
        const newGenres = Array.from(uniqueGenres).filter(g => !genreMap.has(g));
        if (newGenres.length > 0) {
            console.log(`Adding ${newGenres.length} new genres...`);
            const { data: insertedG, error: gInsErr } = await db.from('genres')
                .insert(newGenres.map(name => ({ name })))
                .select();
            if (gInsErr) throw gInsErr;
            insertedG?.forEach(g => genreMap.set(g.name, g.id));
        }
        console.log(`Mapped ${genreMap.size} genres.`);

        // C. Insert MOVIES
        console.log('Inserting Movies...');
        let moviesBatch: any[] = [];
        let insertedMovies = 0;

        for (const m of moviesStore.values()) {
            const directorName = m.directorNconst ? nameMap.get(m.directorNconst) : 'Unknown';

            moviesBatch.push({
                id: m.id,
                title: m.title.substring(0, 100), // truncate
                year: m.year,
                director: directorName || 'Unknown'
            });

            if (moviesBatch.length >= BATCH_SIZE) {
                const { error } = await db.from('movies').upsert(moviesBatch, { onConflict: 'id' });
                if (error) { console.error('Mov Err', error); throw error; }
                insertedMovies += moviesBatch.length;
                process.stdout.write(`\rMovies: ${insertedMovies}`);
                moviesBatch = [];
            }
        }
        if (moviesBatch.length > 0) await db.from('movies').upsert(moviesBatch, { onConflict: 'id' });
        console.log('\nMovies inserted.');

        // D. Insert STARS_IN_MOVIES (Filtered)
        console.log('Inserting Stars_In_Movies...');
        let simBatch: any[] = [];
        let insertedSim = 0;
        let skippedSim = 0;

        for (const rel of starRelations) {
            if (foundStars.has(rel.starId)) {
                simBatch.push(rel);
                if (simBatch.length >= BATCH_SIZE) {
                    const { error } = await db.from('stars_in_movies').upsert(simBatch, { ignoreDuplicates: true });
                    if (error) { console.error('SIM Err', error); throw error; }
                    insertedSim += simBatch.length;
                    process.stdout.write(`\rRelations: ${insertedSim}`);
                    simBatch = [];
                }
            } else {
                skippedSim++;
            }
        }
        if (simBatch.length > 0) await db.from('stars_in_movies').upsert(simBatch, { ignoreDuplicates: true });
        console.log(`\nRelations inserted: ${insertedSim}. Skipped orphans: ${skippedSim}.`);

        // E. Insert GENRES_IN_MOVIES
        console.log('\nInserting Genres_In_Movies...');
        let gimBatch: any[] = [];
        for (const m of moviesStore.values()) {
            for (const gName of m.genres) {
                const gId = genreMap.get(gName);
                if (gId) {
                    gimBatch.push({ movieId: m.id, genreId: gId });
                }
            }
            if (gimBatch.length >= BATCH_SIZE) {
                await db.from('genres_in_movies').upsert(gimBatch, { ignoreDuplicates: true });
                gimBatch = [];
            }
        }
        if (gimBatch.length > 0) await db.from('genres_in_movies').upsert(gimBatch, { ignoreDuplicates: true });

        // F. Insert RATINGS
        console.log('\nInserting Ratings...');
        const rlRatingsFinal = getStream('title.ratings.tsv.gz');
        let ratingsBatch: any[] = [];
        count = 0;
        for await (const line of rlRatingsFinal) {
            if (count++ === 0) continue;
            const [tconst, avg, votes] = line.split('\t');
            if (validTconsts.has(tconst)) {
                ratingsBatch.push({
                    movieId: tconst,
                    rating: parseFloat(avg),
                    numVotes: parseInt(votes)
                });
                if (ratingsBatch.length >= BATCH_SIZE) {
                    await db.from('ratings').upsert(ratingsBatch, { ignoreDuplicates: true });
                    ratingsBatch = [];
                }
            }
        }
        if (ratingsBatch.length > 0) await db.from('ratings').upsert(ratingsBatch);

        console.log('\nDone!');

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();

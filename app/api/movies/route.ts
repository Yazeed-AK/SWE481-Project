
import { NextResponse } from 'next/server';
import { queries } from '@/lib/queries';

/**
 * GET /api/movies
 * Retrieves a list of movies, optionally filtered by a search query.
 * @param request - The incoming HTTP request.
 * @returns A JSON response containing the list of movies or an error message.
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('search')?.trim() ?? '';
    const page = parsePositiveInt(searchParams.get('page'), 1);
    const limit = parsePositiveInt(searchParams.get('limit'), 10);

    try {
        let movies;
        if (query) {
            movies = await queries.searchMovies(query);
        } else {
            movies = await queries.getMovies(page, limit);
        }
        return NextResponse.json(movies);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 });
    }
}

function parsePositiveInt(value: string | null, fallback: number): number {
    if (!value) {
        return fallback;
    }

    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < 1) {
        return fallback;
    }

    return parsed;
}
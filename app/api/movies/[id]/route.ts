
import { NextResponse } from 'next/server';
import { queries } from '@/lib/queries';

/**
 * GET /api/movies/[id]
 * Retrieves detailed information for a specific movie.
 * @param _request - The incoming HTTP request.
 * @param params - The route parameters containing the movie ID.
 * @returns A JSON response containing the movie details or an error message.
 */
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const movie = await queries.getMovieById(id);
        if (!movie.data) {
            return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
        }
        return NextResponse.json(movie);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch movie' }, { status: 500 });
    }
}

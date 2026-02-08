
import { NextResponse } from 'next/server';
import { queries } from '@/lib/queries';

export async function GET(
    request: Request,
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

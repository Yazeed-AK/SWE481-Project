
import { NextResponse } from 'next/server';
import { queries } from '@/lib/queries';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');

    try {
        let movies;
        if (query) {
            movies = await queries.searchMovies(query);
        } else {
            movies = await queries.getMovies(page);
        }
        return NextResponse.json(movies);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 });
    }
}

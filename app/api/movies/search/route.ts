import { NextResponse } from 'next/server';
import { queries } from '@/lib/queries';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();

    if (!query) {
        return NextResponse.json(
            { error: 'Missing required query parameter: q' },
            { status: 400 }
        );
    }

    try {
        const movies = await queries.searchMovies(query);
        return NextResponse.json(movies);
    } catch {
        return NextResponse.json({ error: 'Failed to search movies' }, { status: 500 });
    }
}

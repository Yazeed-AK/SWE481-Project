import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from('movies')
      .select(`
        id, 
        title, 
        year, 
        director, 
        ratings(rating, numVotes),
        stars_in_movies(stars(id, name, birthYear)),
        genres_in_movies!inner(genres!inner(id, name))
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
      }
      return NextResponse.json({ error: (error instanceof Error ? error.message : (typeof error === "object" && error !== null && "message" in error ? String((error as Record<string, unknown>).message) : String(error))) }, { status: 500 });
    }

    if (!data) {
        return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }

    const formattedData = {
      ...data,
      rating: (data.ratings as unknown as { rating: number; numVotes: number }) || { rating: null, numVotes: 0 },
      stars: data.stars_in_movies?.map((sim: { stars?: unknown }) => sim.stars) || [],
      genres: data.genres_in_movies?.map((gim: { genres?: unknown }) => gim.genres) || [],
    };

    return NextResponse.json({ data: formattedData });

  } catch (error: unknown) {
    return NextResponse.json({ error: (error instanceof Error ? error.message : (typeof error === "object" && error !== null && "message" in error ? String((error as Record<string, unknown>).message) : String(error))) || 'Internal Server Error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;
    
    // Filtering parameters
    const title = searchParams.get('title');
    const year = searchParams.get('year');
    const director = searchParams.get('director');
    const genre = searchParams.get('genre');
    
    // Sorting (default to rating descending)
    const sortBy = searchParams.get('sort') || 'rating'; 

    let query = supabase
      .from('movies')
      .select(`
        id, 
        title, 
        year, 
        director, 
        ratings(rating, numVotes),
        stars_in_movies(stars(name)),
        genres_in_movies!inner(genres!inner(name))
      `, { count: 'exact' });

    // Apply Filters
    if (title) query = query.ilike('title', `%${title}%`);
    if (year) query = query.eq('year', parseInt(year));
    if (director) query = query.ilike('director', `%${director}%`);
    if (genre) query = query.ilike('genres_in_movies.genres.name', `%${genre}%`);

    // Apply Sorting
    if (sortBy === 'title') {
      query = query.order('title', { ascending: true });
    } else if (sortBy === 'year') {
      query = query.order('year', { ascending: false });
    } else {
      // Sorting by rating requires ordering on the joined ratings table natively or via database views for true efficiency.
      // Below is a simplified fallback for joining logic ordering. 
      query = query.order('rating', { foreignTable: 'ratings', ascending: false });
    }

    // Apply Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: (error instanceof Error ? error.message : (typeof error === "object" && error !== null && "message" in error ? String((error as Record<string, unknown>).message) : String(error))) }, { status: 500 });
    }

    // Format Data for frontend consumption
    const formattedData = data?.map(movie => ({
      ...movie,
      rating: (movie.ratings as unknown as { rating: number; numVotes: number })?.rating || null,
      numVotes: (movie.ratings as unknown as { rating: number; numVotes: number })?.numVotes || 0,
      stars: movie.stars_in_movies?.map((sim: { stars?: { name?: string } }) => sim.stars?.name) || [],
      genres: movie.genres_in_movies?.map((gim: { genres?: { name?: string } }) => gim.genres?.name) || [],
    }));

    return NextResponse.json({
      data: formattedData,
      meta: {
        page,
        limit,
        total: count,
        totalPages: count ? Math.ceil(count / limit) : 0
      }
    });

  } catch (error: unknown) {
    return NextResponse.json({ error: (error instanceof Error ? error.message : (typeof error === "object" && error !== null && "message" in error ? String((error as Record<string, unknown>).message) : String(error))) || 'Internal Server Error' }, { status: 500 });
  }
}

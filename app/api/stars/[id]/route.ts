import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from('stars')
      .select(`
        id, 
        name, 
        birthYear,
        stars_in_movies(movies(id, title, year, director))
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Star not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
        return NextResponse.json({ error: 'Star not found' }, { status: 404 });
    }

    const { stars_in_movies, ...rest } = data;
    const formattedData = {
      ...rest,
      movies: stars_in_movies?.map((sim: any) => sim.movies) || [],
    };

    return NextResponse.json({ data: formattedData });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

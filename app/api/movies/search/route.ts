import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Search by title (partial matching using 'q' parameter)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    
    if (!q) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    // Default limit
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const { data, error } = await supabase
      .from('movies')
      .select('id, title, year')
      .ilike('title', `%${q}%`)
      .order('year', { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

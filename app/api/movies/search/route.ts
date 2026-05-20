import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function formatTsQuery(q: string): string {
  const sanitized = q.replace(/[^\w\s]/g, '');
  const words = sanitized.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  return words.map(word => `${word}:*`).join(' & ');
}

// Search by title (partial matching using 'q' parameter)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();
    
    if (!q) {
      return NextResponse.json({ error: 'Missing required query parameter: q' }, { status: 400 });
    }

    const formattedQuery = formatTsQuery(q);
    if (!formattedQuery) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    // Default limit
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const { data, error } = await supabase
      .from('movies')
      .select('id, title, year')
      .textSearch('title', formattedQuery, {
        config: 'english',
        type: 'to_tsquery' as unknown as 'websearch'
      })
      .order('year', { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: 'Failed to search movies' }, { status: 500 });
    }

    return NextResponse.json({ data });

  } catch {
    return NextResponse.json({ error: 'Failed to search movies' }, { status: 500 });
  }
}

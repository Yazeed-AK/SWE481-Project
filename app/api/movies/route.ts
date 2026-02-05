// app/api/movies/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db'; 

export async function GET() {
  try {
    const sql = `
      SELECT m.id, m.title, m.year, m.director, r.rating
      FROM movies m
      LEFT JOIN ratings r ON m.id = r.movieId
      ORDER BY r.rating DESC NULLS LAST
      LIMIT 10;
    `;
    
    const result = await query(sql);
    
    return NextResponse.json({ 
      success: true, 
      data: result.rows 
    });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch movies' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    // 1. Authenticate Request
    // Normally, you would use supabase.auth.getUser(token) extracting the token from headers.
    // Assuming the user is validating their session token for this request.
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    // 2. Process Rating
    const { movieId, rating } = await request.json();

    if (!movieId || typeof rating !== 'number' || rating < 0 || rating > 10) {
      return NextResponse.json({ error: 'Invalid movieId or rating (must be 0-10)' }, { status: 400 });
    }

    // We fetch the current rating line for the movie to increment it.
    // Note: Concurrency issues could arise here if high scale. Supabase provides RPC for atomic updates, 
    // but a simplified read/update follows for baseline implementation.

    const { data: currentRatingData, error: fetchError } = await supabase
      .from('ratings')
      .select('rating, numVotes')
      .eq('movieId', movieId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is not found
       return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    let newRating = rating;
    let newNumVotes = 1;

    if (currentRatingData) {
      const oldTotal = currentRatingData.rating * currentRatingData.numVotes;
      newNumVotes = currentRatingData.numVotes + 1;
      newRating = (oldTotal + rating) / newNumVotes;
    }

    const { error: upsertError } = await supabase
      .from('ratings')
      .upsert({ 
        movieId, 
        rating: newRating, 
        numVotes: newNumVotes 
      }, { onConflict: 'movieId' });

    if (upsertError) {
       return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    return NextResponse.json({ 
        message: 'Rating submitted successfully', 
        newAverage: newRating.toFixed(1),
        totalVotes: newNumVotes
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

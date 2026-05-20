import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const email = user.email;

    if (!email) {
      return NextResponse.json({ error: 'Missing email address associated with session' }, { status: 400 });
    }

    // Lookup real numeric customer ID
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (customerError || !customerData) {
      return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 });
    }

    const realCustomerId = customerData.id;

    // Fetch the user's purchased movies from the sales table
    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .select(`
        id,
        saleDate,
        movieId,
        movies (
          id,
          title,
          year,
          director
        )
      `)
      .eq('customerId', realCustomerId)
      .order('saleDate', { ascending: false });

    if (salesError) {
      return NextResponse.json({ error: salesError.message }, { status: 500 });
    }

    // Format the response to return a cleaner array of movies
    const library = salesData.map(sale => ({
      saleId: sale.id,
      purchaseDate: sale.saleDate,
      ...sale.movies
    }));

    return NextResponse.json({ library });

  } catch (error: unknown) {
    return NextResponse.json({ error: (error instanceof Error ? error.message : 'Internal Server Error') }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email, ccId, cart } = await request.json();

    if (!email || !ccId || !cart || cart.length === 0) {
      return NextResponse.json({ error: 'Missing required checkout information or empty cart' }, { status: 400 });
    }

    // Lookup real numeric customer ID to satisfy the sales Foreign Key
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (customerError || !customerData) {
      return NextResponse.json({ error: 'Customer profile not found in database. Please update your Profile first.' }, { status: 400 });
    }

    const realCustomerId = customerData.id;

    // Extract and sanitize
    const cleanCcId = ccId?.trim();

    // 1. Validate Credit Card
    const { data: ccData, error: ccError } = await supabase
      .from('creditcards')
      .select('id, expiration')
      .eq('id', cleanCcId)
      .single();

    if (ccError || !ccData) {
      console.log('CC Validation Error:', ccError, cleanCcId);
      return NextResponse.json({ error: 'Invalid credit card information' }, { status: 400 });
    }

    // Check expiration (assuming format YYYY-MM-DD)
    const today = new Date();
    const expDate = new Date(ccData.expiration);
    if (expDate < today) {
      return NextResponse.json({ error: 'Credit card is expired' }, { status: 400 });
    }

    // 2. Process Sales
    // We insert a row into 'sales' for every movie in the cart
    const salesInserts = cart.map((movie: { id: string }) => ({
      customerId: realCustomerId,
      movieId: movie.id,
      saleDate: new Date().toISOString().split('T')[0] // current date YYYY-MM-DD
    }));

    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .insert(salesInserts)
      .select();

    if (salesError) {
      return NextResponse.json({ error: salesError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Transaction successful',
      sales: salesData
    });

  } catch (error: unknown) {
    return NextResponse.json({ error: (error instanceof Error ? error.message : (typeof error === "object" && error !== null && "message" in error ? String((error as Record<string, unknown>).message) : String(error))) || 'Internal Server Error' }, { status: 500 });
  }
}

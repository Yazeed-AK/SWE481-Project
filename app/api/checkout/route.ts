import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
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

    const body = await request.json();

    // Sanitize all inputs — trim whitespace and normalize email to lowercase
    const email = body.email?.trim().toLowerCase();

    if (email !== user.email?.trim().toLowerCase()) {
      return NextResponse.json({ error: 'Forbidden: Email mismatch' }, { status: 403 });
    }

    const firstName = body.firstName?.trim();
    const lastName = body.lastName?.trim();
    const ccId = body.ccId;
    const ccExpiration = body.ccExpiration;
    const cart = body.cart;

    if (!email || !firstName || !lastName || !ccId || !ccExpiration || !cart || cart.length === 0) {
      return NextResponse.json({ error: 'Missing required checkout information or empty cart' }, { status: 400 });
    }

    // Lookup real numeric customer ID to satisfy the sales Foreign Key
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (customerError) {
      console.error('[CHECKOUT] DB error looking up customer:', customerError);
      return NextResponse.json({ error: 'Database error while looking up customer. Please try again.' }, { status: 500 });
    }

    if (!customerData) {
      console.error('[CHECKOUT] No customer found for email:', email);
      return NextResponse.json({ error: 'Customer profile not found. Please make sure you are registered and logged in.' }, { status: 404 });
    }

    const realCustomerId = customerData.id;

    // Extract and sanitize
    const cleanCcId = ccId?.trim();

    if (!/^\d{13,19}$/.test(cleanCcId)) {
      return NextResponse.json({ error: 'Invalid credit card format. Must be 13 to 19 digits.' }, { status: 400 });
    }

    // Check expiration (assuming format YYYY-MM-DD or YYYY-MM)
    const today = new Date();
    const expDate = new Date(ccExpiration);
    if (expDate < today) {
      return NextResponse.json({ error: 'Credit card is expired' }, { status: 400 });
    }

    // 1. Process Credit Card
    const { error: ccUpsertError } = await supabase
      .from('creditcards')
      .upsert([{ 
        id: cleanCcId,
        firstName: firstName,
        lastName: lastName,
        expiration: ccExpiration
      }]);

    if (ccUpsertError) {
      console.log('CC Upsert Error:', ccUpsertError);
      return NextResponse.json({ error: 'Failed to save credit card information' }, { status: 500 });
    }

    // Link customer to the credit card
    await supabase.from('customers').update({ ccId: cleanCcId }).eq('id', realCustomerId);

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

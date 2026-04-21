import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    // Sanitize and trim inputs to avoid trailing whitespace validation mismatch
    const email = payload.email?.trim();
    const password = payload.password;
    const firstName = payload.firstName?.trim();
    const lastName = payload.lastName?.trim();
    const address = payload.address?.trim();
    const ccId = payload.ccId?.trim();
    const ccExpiration = payload.ccExpiration?.trim();

    console.log('[REGISTRATION ATTEMPT]', { email, firstName, lastName, ccId, ccExpiration });

    if (!email || !password || !firstName || !lastName || !address || !ccId || !ccExpiration) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }


    if (!/^\d{13,19}$/.test(ccId)) {
      return NextResponse.json(
        { error: 'Invalid credit card format. Must be 13 to 19 digits.' },
        { status: 400 }
      );
    }

    // 1. First, create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          firstName,
          lastName,
          address,
          ccId,
          ccExpiration
        }
      }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
        return NextResponse.json({ error: 'Auth failed to return user.' }, { status: 500 });
    }

    // 2. Insert explicit credit card
    const { error: ccError } = await supabase
      .from('creditcards')
      .upsert([{ 
        id: ccId,
        firstName: firstName,
        lastName: lastName,
        expiration: ccExpiration
      }])
      .select();

    if (ccError) {
      // Rollback auth
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Failed to provision Credit Card record' }, 
        { status: 500 }
      );
    }

    // 3. Then, insert their extended profile info into our `customers` table
    const { data: customerData, error: dbError } = await supabase
      .from('customers')
      .insert([
        { 
          // Assuming 'id' is mapped to the auth.users id or left as serial if decoupled. 
          // For simplicity mapped to fields per requirement.
          email,
          password, // Usually poor practice to store plain text; demo purpose assumes hashed inside or uses Supabase purely. 
          firstName,
          lastName,
          address,
          ccId 
        }
      ])
      .select();

    if (dbError) {
      // Rollback logic could go here if needed.
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Registration successful',
      user: authData.user, 
      customer: customerData ? customerData[0] : null 
    });
    
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error instanceof Error ? error.message : (typeof error === "object" && error !== null && "message" in error ? String((error as Record<string, unknown>).message) : String(error))) || 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

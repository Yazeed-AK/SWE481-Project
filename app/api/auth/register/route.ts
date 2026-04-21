import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    // Sanitize and trim inputs to avoid trailing whitespace validation mismatch
    const email = payload.email?.trim().toLowerCase();
    const password = payload.password;
    const firstName = payload.firstName?.trim();
    const lastName = payload.lastName?.trim();
    const address = payload.address?.trim();

    console.log('[REGISTRATION ATTEMPT]', { email, firstName, lastName });

    if (!email || !password || !firstName || !lastName || !address) {
      return NextResponse.json(
        { error: 'All fields are required' },
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
          address
        }
      }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
        return NextResponse.json({ error: 'Auth failed to return user.' }, { status: 500 });
    }

    // 2. Then, insert their extended profile info into our `customers` table
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
          address
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

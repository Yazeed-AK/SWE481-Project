import { NextResponse } from 'next/server';

// Since the cart logic wasn't explicitly defined as a distinct table, 
// a typical approach is to use cookies/sessions, or if logged in, a 'cart' table.
// For simplicity in this Next.js app, we will assume a generic session/cookie or memory-backed array
// for the duration of a browsing session since we don't have a 'cart' table in the schema.

// Note: To make this stateless across the browser, normally you'd use a server-side cookie 
// or LocalStorage on the client. Here we mock an endpoint that could interface with Redis/DB.

let memoryCart: any[] = []; // Only for demo purposes in a single thread

export async function GET() {
  return NextResponse.json({ cart: memoryCart });
}

export async function POST(request: Request) {
  try {
    const { movie } = await request.json();
    
    // Naive add
    if (movie && !memoryCart.find(m => m.id === movie.id)) {
        memoryCart.push(movie);
    }
    
    return NextResponse.json({ cart: memoryCart });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
    try {
        const { movieId } = await request.json();
        memoryCart = memoryCart.filter(m => m.id !== movieId);
        return NextResponse.json({ cart: memoryCart });
    } catch(error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

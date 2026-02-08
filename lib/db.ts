
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'placeholder';

// Provide a warning but don't crash during build
if (!process.env.SUPABASE_URL) {
    console.warn('Missing Supabase environment variables, using placeholders.');
}

export const db = createClient(supabaseUrl, supabaseKey);

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/utils/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables. Check your .env file.'
  );
}

export const supabaseClient = createClient<Database>(
  supabaseUrl, 
  supabaseAnonKey
); 
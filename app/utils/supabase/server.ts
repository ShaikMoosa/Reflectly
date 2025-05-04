import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createClient() {
  // Get Supabase URL and anon key from environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  // Create and return the client
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
} 
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/utils/supabase';

// Use dummy values for build time if environment variables are missing
// These will be replaced with actual values at runtime
const dummyUrl = process.env.NODE_ENV === 'production' ? 'https://dummy-for-build.supabase.co' : 'http://localhost:54321';
const dummyKey = 'dummy-key-for-build-time-only';

// Server-side client should NOT be a singleton since it needs to be created 
// for each request context in a server component
export function createClient() {
  // Get Supabase URL and anon key from environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || dummyUrl;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || dummyKey;
  
  // Log warning if environment variables are missing
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  
  // Create and return the client with a unique context for this request
  return createSupabaseClient<Database>(
    supabaseUrl, 
    supabaseAnonKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    }
  );
} 
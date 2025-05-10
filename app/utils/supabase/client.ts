import { createClient } from '@supabase/supabase-js';
import { Database } from '@/utils/supabase';

// Use dummy values for build time if environment variables are missing
// These will be replaced with actual values at runtime
const dummyUrl = process.env.NODE_ENV === 'production' ? 'https://dummy-for-build.supabase.co' : 'http://localhost:54321';
const dummyKey = 'dummy-key-for-build-time-only';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || dummyUrl;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || dummyKey;

// Warning if env vars are missing
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error(
    'Missing Supabase environment variables. Check your .env file.'
  );
}

// Use a singleton pattern for the client
let clientInstance: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseClient() {
  if (clientInstance) return clientInstance;
  
  clientInstance = createClient<Database>(
    supabaseUrl, 
    supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    }
  );
  
  return clientInstance;
}

// For backward compatibility
export const supabaseClient = getSupabaseClient(); 
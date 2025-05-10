import { createClient } from '@supabase/supabase-js';
import { Database } from '@/utils/supabase';

// Use dummy values for build time if environment variables are missing
// These will be replaced with actual values at runtime
const dummyUrl = process.env.NODE_ENV === 'production' ? 'https://dummy-for-build.supabase.co' : 'http://localhost:54321';
const dummyKey = 'dummy-key-for-build-time-only';

// Admin Supabase client for administrative operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || dummyUrl;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || dummyKey;

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    'Missing Supabase environment variables. Check your .env file.'
  );
}

export const supabaseAdminClient = createClient<Database>(
  supabaseUrl, 
  supabaseServiceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  }
); 
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/utils/supabase';

// Server-side Supabase client with service role for authorized operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error(
    'Missing Supabase environment variables. Check your .env file.'
  );
}

export const supabaseServerClient = createClient<Database>(
  supabaseUrl, 
  supabaseServiceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  }
); 
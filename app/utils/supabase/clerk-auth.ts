import { currentUser, auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/utils/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Creates a Supabase client that uses the Clerk user ID for data access.
 * This client will respect RLS policies that use auth.uid()
 */
export const getSupabaseClient = async () => {
  // Get the current user from Clerk
  const user = await currentUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Create a custom Supabase client with the clerk user ID as custom auth
  return createClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      global: {
        headers: {
          'x-clerk-user-id': user.id
        }
      }
    }
  );
};

/**
 * Server-side helper to get Supabase client with Clerk auth
 * Uses the userId from Clerk's auth() function for server components
 */
export const getServerSupabaseClient = async () => {
  const session = await auth();
  
  if (!session.userId) {
    throw new Error('User not authenticated');
  }

  // Create a custom Supabase client with server role but clerk user context
  return createClient<Database>(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
      global: {
        headers: {
          'x-clerk-user-id': session.userId
        }
      }
    }
  );
}; 
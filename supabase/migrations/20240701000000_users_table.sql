-- Create users table for Clerk integration
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY, -- Clerk user ID
  email TEXT UNIQUE,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Update/override existing table with proper structure if needed
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Enable RLS for users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can only view their own data
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (id = auth.uid());

-- Users can only update their own data
CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (id = auth.uid());

-- Only admins can insert or delete users
CREATE POLICY "Only admins can insert users" ON public.users
  FOR INSERT WITH CHECK (
    -- Allow service role or admin role
    (SELECT current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
  );

CREATE POLICY "Only admins can delete users" ON public.users
  FOR DELETE USING (
    -- Allow service role or admin role
    (SELECT current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
  );

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at(); 
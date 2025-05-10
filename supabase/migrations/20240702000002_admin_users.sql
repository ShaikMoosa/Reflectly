-- Create admin_users table
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  CONSTRAINT unique_admin_user UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Only admins can view admin_users"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.admin_users
    )
  );

-- Create RPC functions for admin operations
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE user_id = $1
  );
END;
$$;

CREATE OR REPLACE FUNCTION add_admin_user(admin_user_id UUID, target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_requestor_admin BOOLEAN;
BEGIN
  -- Check if the requesting user is an admin
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE user_id = admin_user_id
  ) INTO is_requestor_admin;
  
  -- Only admins can add other admins
  IF NOT is_requestor_admin THEN
    RETURN FALSE;
  END IF;
  
  -- Add the target user as an admin
  INSERT INTO public.admin_users (user_id, created_by)
  VALUES (target_user_id, admin_user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION remove_admin_user(admin_user_id UUID, target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_requestor_admin BOOLEAN;
  admin_count INTEGER;
BEGIN
  -- Check if the requesting user is an admin
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE user_id = admin_user_id
  ) INTO is_requestor_admin;
  
  -- Only admins can remove other admins
  IF NOT is_requestor_admin THEN
    RETURN FALSE;
  END IF;
  
  -- Get the total count of admins
  SELECT COUNT(*) 
  FROM public.admin_users
  INTO admin_count;
  
  -- Don't allow removing the last admin
  IF admin_count <= 1 THEN
    RETURN FALSE;
  END IF;
  
  -- Don't allow admins to remove themselves
  IF admin_user_id = target_user_id THEN
    RETURN FALSE;
  END IF;
  
  -- Remove the target user from admins
  DELETE FROM public.admin_users
  WHERE user_id = target_user_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Grant permissions for admin functions
REVOKE ALL ON FUNCTION is_admin FROM PUBLIC;
REVOKE ALL ON FUNCTION add_admin_user FROM PUBLIC;
REVOKE ALL ON FUNCTION remove_admin_user FROM PUBLIC;

GRANT EXECUTE ON FUNCTION is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION add_admin_user TO authenticated;
GRANT EXECUTE ON FUNCTION remove_admin_user TO authenticated; 
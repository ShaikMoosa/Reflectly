-- Drop policies for whiteboard_data
DROP POLICY IF EXISTS "Users can view their own whiteboard data" ON public.whiteboard_data;
DROP POLICY IF EXISTS "Users can insert their own whiteboard data" ON public.whiteboard_data;
DROP POLICY IF EXISTS "Users can update their own whiteboard data" ON public.whiteboard_data;
DROP POLICY IF EXISTS "Users can delete their own whiteboard data" ON public.whiteboard_data;

-- Drop trigger
DROP TRIGGER IF EXISTS set_whiteboard_updated_at ON public.whiteboard_data;

-- Drop index
DROP INDEX IF EXISTS idx_whiteboard_user_id;

-- Drop the whiteboard_data table
DROP TABLE IF EXISTS public.whiteboard_data; 
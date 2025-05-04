-- supabase/migrations/YYYYMMDDHHMMSS_rls_enable_planner_policies.sql

-- Enable Row Level Security for planner tables
ALTER TABLE public.planner_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planner_tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view their own columns" ON public.planner_columns;
DROP POLICY IF EXISTS "Users can insert their own columns" ON public.planner_columns;
DROP POLICY IF EXISTS "Users can update their own columns" ON public.planner_columns;
DROP POLICY IF EXISTS "Users can delete their own columns" ON public.planner_columns;

DROP POLICY IF EXISTS "Users can view their own tasks" ON public.planner_tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON public.planner_tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.planner_tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.planner_tasks;

-- Create RLS policies for planner_columns
CREATE POLICY "Users can view their own columns" 
ON public.planner_columns FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own columns" 
ON public.planner_columns FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own columns" 
ON public.planner_columns FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own columns" 
ON public.planner_columns FOR DELETE
USING (auth.uid() = user_id);

-- Create RLS policies for planner_tasks
CREATE POLICY "Users can view their own tasks" 
ON public.planner_tasks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" 
ON public.planner_tasks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" 
ON public.planner_tasks FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" 
ON public.planner_tasks FOR DELETE
USING (auth.uid() = user_id); 
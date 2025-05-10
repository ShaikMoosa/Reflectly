-- Create whiteboard_data table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.whiteboard_data (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create kanban_board table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.kanban_board (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE public.whiteboard_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_board ENABLE ROW LEVEL SECURITY;

-- Create policies for whiteboard_data
DROP POLICY IF EXISTS "Users can view their own whiteboard data" ON public.whiteboard_data;
DROP POLICY IF EXISTS "Users can insert their own whiteboard data" ON public.whiteboard_data;
DROP POLICY IF EXISTS "Users can update their own whiteboard data" ON public.whiteboard_data;
DROP POLICY IF EXISTS "Users can delete their own whiteboard data" ON public.whiteboard_data;

CREATE POLICY "Users can view their own whiteboard data" 
ON public.whiteboard_data FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own whiteboard data" 
ON public.whiteboard_data FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own whiteboard data" 
ON public.whiteboard_data FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own whiteboard data" 
ON public.whiteboard_data FOR DELETE 
USING (user_id = auth.uid());

-- Create policies for kanban_board
DROP POLICY IF EXISTS "Users can view their own kanban board" ON public.kanban_board;
DROP POLICY IF EXISTS "Users can insert their own kanban board" ON public.kanban_board;
DROP POLICY IF EXISTS "Users can update their own kanban board" ON public.kanban_board;
DROP POLICY IF EXISTS "Users can delete their own kanban board" ON public.kanban_board;

CREATE POLICY "Users can view their own kanban board" 
ON public.kanban_board FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own kanban board" 
ON public.kanban_board FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own kanban board" 
ON public.kanban_board FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own kanban board" 
ON public.kanban_board FOR DELETE 
USING (user_id = auth.uid());

-- Create update trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create update triggers
DROP TRIGGER IF EXISTS set_whiteboard_updated_at ON public.whiteboard_data;
CREATE TRIGGER set_whiteboard_updated_at
BEFORE UPDATE ON public.whiteboard_data
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_kanban_updated_at ON public.kanban_board;
CREATE TRIGGER set_kanban_updated_at
BEFORE UPDATE ON public.kanban_board
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Ensure proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_whiteboard_user_id ON public.whiteboard_data(user_id);
CREATE INDEX IF NOT EXISTS idx_kanban_user_id ON public.kanban_board(user_id); 
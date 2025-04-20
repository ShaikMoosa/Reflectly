-- Create tables
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  user_id TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.transcripts (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  segments JSONB NOT NULL DEFAULT '[]'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.whiteboard_data (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.kanban_board (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create RLS policies
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whiteboard_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_board ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Users can view their own projects" 
ON public.projects FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own projects" 
ON public.projects FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own projects" 
ON public.projects FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own projects" 
ON public.projects FOR DELETE 
USING (user_id = auth.uid());

-- Transcripts policies
CREATE POLICY "Users can view transcripts of their own projects" 
ON public.transcripts FOR SELECT 
USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert transcripts for their own projects" 
ON public.transcripts FOR INSERT 
WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can update transcripts of their own projects" 
ON public.transcripts FOR UPDATE 
USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()))
WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete transcripts of their own projects" 
ON public.transcripts FOR DELETE 
USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

-- Whiteboard data policies
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

-- Kanban board policies
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

-- Create update trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create update triggers
CREATE TRIGGER set_whiteboard_updated_at
BEFORE UPDATE ON public.whiteboard_data
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_kanban_updated_at
BEFORE UPDATE ON public.kanban_board
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at(); 
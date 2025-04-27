-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create video_transcripts table (accessible when logged out)
CREATE TABLE IF NOT EXISTS public.video_transcripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '[]'::JSONB,
  duration INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_notes table
CREATE TABLE IF NOT EXISTS public.user_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create ai_chat_history table
CREATE TABLE IF NOT EXISTS public.ai_chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_history ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Users can view their own projects" 
ON public.projects FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own projects" 
ON public.projects FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own projects" 
ON public.projects FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own projects" 
ON public.projects FOR DELETE 
USING (user_id = auth.uid());

-- Video transcripts policies - Allow public read access but restrict write access
CREATE POLICY "Anyone can view video transcripts" 
ON public.video_transcripts FOR SELECT 
USING (true);

CREATE POLICY "Users can insert video transcripts for their projects" 
ON public.video_transcripts FOR INSERT 
WITH CHECK (
  project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update video transcripts for their projects" 
ON public.video_transcripts FOR UPDATE 
USING (
  project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete video transcripts for their projects" 
ON public.video_transcripts FOR DELETE 
USING (
  project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
);

-- User notes policies
CREATE POLICY "Users can view their own notes" 
ON public.user_notes FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own notes" 
ON public.user_notes FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own notes" 
ON public.user_notes FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own notes" 
ON public.user_notes FOR DELETE 
USING (user_id = auth.uid());

-- AI chat history policies
CREATE POLICY "Users can view their own chat history" 
ON public.ai_chat_history FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own chat history" 
ON public.ai_chat_history FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own chat history" 
ON public.ai_chat_history FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own chat history" 
ON public.ai_chat_history FOR DELETE 
USING (user_id = auth.uid());

-- Create updated_at triggers for all tables
CREATE TRIGGER set_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_video_transcripts_updated_at
BEFORE UPDATE ON public.video_transcripts
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_user_notes_updated_at
BEFORE UPDATE ON public.user_notes
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_ai_chat_history_updated_at
BEFORE UPDATE ON public.ai_chat_history
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_video_transcripts_project_id ON public.video_transcripts(project_id);
CREATE INDEX idx_user_notes_user_id ON public.user_notes(user_id);
CREATE INDEX idx_user_notes_project_id ON public.user_notes(project_id);
CREATE INDEX idx_ai_chat_history_user_id ON public.ai_chat_history(user_id);
CREATE INDEX idx_ai_chat_history_project_id ON public.ai_chat_history(project_id); 
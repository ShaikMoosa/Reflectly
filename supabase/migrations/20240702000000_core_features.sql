-- Create transcripts table
CREATE TABLE IF NOT EXISTS public.transcripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '[]'::JSONB,
  audio_url TEXT,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create notes table
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create chat history table
CREATE TABLE IF NOT EXISTS public.chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  title TEXT,
  messages JSONB NOT NULL DEFAULT '[]'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create planner table
CREATE TABLE IF NOT EXISTS public.planner (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for all tables
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planner ENABLE ROW LEVEL SECURITY;

-- Transcripts policies
CREATE POLICY "Users can view their own transcripts" ON public.transcripts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own transcripts" ON public.transcripts
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own transcripts" ON public.transcripts
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own transcripts" ON public.transcripts
  FOR DELETE USING (user_id = auth.uid());

-- Notes policies
CREATE POLICY "Users can view their own notes" ON public.notes
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own notes" ON public.notes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own notes" ON public.notes
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own notes" ON public.notes
  FOR DELETE USING (user_id = auth.uid());

-- Chat history policies
CREATE POLICY "Users can view their own chat history" ON public.chat_history
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own chat history" ON public.chat_history
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own chat history" ON public.chat_history
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own chat history" ON public.chat_history
  FOR DELETE USING (user_id = auth.uid());

-- Planner policies
CREATE POLICY "Users can view their own planner" ON public.planner
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own planner" ON public.planner
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own planner" ON public.planner
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own planner" ON public.planner
  FOR DELETE USING (user_id = auth.uid());

-- Add update triggers for all tables
DROP TRIGGER IF EXISTS set_transcripts_updated_at ON public.transcripts;
CREATE TRIGGER set_transcripts_updated_at
  BEFORE UPDATE ON public.transcripts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_notes_updated_at ON public.notes;
CREATE TRIGGER set_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_chat_history_updated_at ON public.chat_history;
CREATE TRIGGER set_chat_history_updated_at
  BEFORE UPDATE ON public.chat_history
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_planner_updated_at ON public.planner;
CREATE TRIGGER set_planner_updated_at
  BEFORE UPDATE ON public.planner
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at(); 
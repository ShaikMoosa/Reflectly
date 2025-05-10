-- supabase/migrations/YYYYMMDDHHMMSS_tbl_create_planner_tables.sql

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the planner_columns table
CREATE TABLE public.planner_columns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    column_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT unique_column_order_per_user UNIQUE (user_id, column_order)
);

-- Add comments to planner_columns table
COMMENT ON TABLE public.planner_columns IS 'Stores the columns for the user planner board.';
COMMENT ON COLUMN public.planner_columns.id IS 'Unique identifier for the column.';
COMMENT ON COLUMN public.planner_columns.user_id IS 'Foreign key referencing the user who owns the column.';
COMMENT ON COLUMN public.planner_columns.title IS 'The title of the column (e.g., Todo, In Progress).';
COMMENT ON COLUMN public.planner_columns.column_order IS 'The display order of the column for a specific user.';
COMMENT ON COLUMN public.planner_columns.created_at IS 'Timestamp when the column was created.';
COMMENT ON COLUMN public.planner_columns.updated_at IS 'Timestamp when the column was last updated.';

-- Create the planner_tasks table
CREATE TABLE public.planner_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    column_id UUID REFERENCES public.planner_columns(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    task_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT unique_task_order_in_column UNIQUE (column_id, task_order)
);

-- Add comments to planner_tasks table
COMMENT ON TABLE public.planner_tasks IS 'Stores the tasks within columns for the user planner board.';
COMMENT ON COLUMN public.planner_tasks.id IS 'Unique identifier for the task.';
COMMENT ON COLUMN public.planner_tasks.user_id IS 'Foreign key referencing the user who owns the task.';
COMMENT ON COLUMN public.planner_tasks.column_id IS 'Foreign key referencing the column this task belongs to.';
COMMENT ON COLUMN public.planner_tasks.content IS 'The text content of the task.';
COMMENT ON COLUMN public.planner_tasks.task_order IS 'The display order of the task within its column.';
COMMENT ON COLUMN public.planner_tasks.created_at IS 'Timestamp when the task was created.';
COMMENT ON COLUMN public.planner_tasks.updated_at IS 'Timestamp when the task was last updated.';

-- Create indexes for frequently queried columns
CREATE INDEX idx_planner_columns_user_id ON public.planner_columns(user_id);
CREATE INDEX idx_planner_tasks_user_id ON public.planner_tasks(user_id);
CREATE INDEX idx_planner_tasks_column_id ON public.planner_tasks(column_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at timestamps
CREATE TRIGGER update_planner_columns_updated_at
BEFORE UPDATE ON public.planner_columns
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_planner_tasks_updated_at
BEFORE UPDATE ON public.planner_tasks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); 
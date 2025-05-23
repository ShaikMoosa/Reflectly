-- Migration: Add video storage fields to video_transcripts table
-- File: 20250115140000_add_video_storage_fields.sql

-- Add video storage columns to video_transcripts table
ALTER TABLE public.video_transcripts 
ADD COLUMN video_url TEXT,
ADD COLUMN file_size BIGINT,
ADD COLUMN storage_path TEXT,
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_video_transcripts_user_id ON public.video_transcripts(user_id);
CREATE INDEX IF NOT EXISTS idx_video_transcripts_storage_path ON public.video_transcripts(storage_path); 
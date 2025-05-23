-- Migration: Add RLS policies for video storage
-- File: 20250115140001_video_storage_rls_policies.sql

-- Create storage bucket for videos if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  false, -- Private bucket, requires authentication
  52428800, -- 50MB limit
  ARRAY['video/mp4', 'video/mpeg', 'video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for videos storage bucket

-- Policy: Users can upload videos to their own folder
CREATE POLICY "Users can upload videos to their folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'videos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can view their own videos
CREATE POLICY "Users can view their own videos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'videos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
); 
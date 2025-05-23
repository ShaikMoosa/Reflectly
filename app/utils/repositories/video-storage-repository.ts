import { supabaseAdminClient } from '../supabase/admin';
import { createClient } from '../supabase/server';
import { v4 as uuidv4 } from 'uuid';

export interface VideoUploadResult {
  videoUrl: string;
  storagePath: string;
  publicUrl: string;
}

export interface VideoMetadata {
  id: string;
  filename: string;
  videoUrl: string;
  storagePath: string;
  fileSize: number;
  duration?: number;
  projectId: string;
  userId: string;
  content: any;
}

/**
 * Repository for managing video storage in Supabase Storage
 */
export const VideoStorageRepository = {
  /**
   * Upload a video file to Supabase Storage
   */
  async uploadVideo({
    file,
    userId,
    projectId
  }: {
    file: File;
    userId: string;
    projectId: string;
  }): Promise<VideoUploadResult> {
    try {
      // Generate unique file path with user isolation
      const fileExtension = file.name.split('.').pop() || 'mp4';
      const fileName = `${uuidv4()}.${fileExtension}`;
      const storagePath = `${userId}/videos/${fileName}`;
      
      // Convert File to Buffer for server-side upload
      const fileArrayBuffer = await file.arrayBuffer();
      const fileBuffer = Buffer.from(fileArrayBuffer);
      
      // Upload to Supabase Storage using admin client
      const { data, error } = await supabaseAdminClient.storage
        .from('videos')
        .upload(storagePath, fileBuffer, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || 'video/mp4'
        });
        
      if (error) {
        console.error('Upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }
      
      // Get public URL
      const { data: urlData } = supabaseAdminClient.storage
        .from('videos')
        .getPublicUrl(storagePath);
        
      return {
        videoUrl: urlData.publicUrl,
        storagePath,
        publicUrl: urlData.publicUrl
      };
    } catch (error) {
      console.error('Error in uploadVideo:', error);
      throw error;
    }
  },
  
  /**
   * Save video metadata to database along with upload
   */
  async saveVideoWithTranscript({
    file,
    userId,
    projectId,
    transcripts,
    duration
  }: {
    file: File;
    userId: string;
    projectId: string;
    transcripts: any;
    duration?: number;
  }): Promise<VideoMetadata> {
    let uploadResult: VideoUploadResult | null = null;
    
    try {
      // Upload video file first
      uploadResult = await this.uploadVideo({
        file,
        userId,
        projectId
      });
      
      // Create Supabase client for database operations
      const supabase = createClient();
      
      // Store transcript with video information
      const transcriptId = uuidv4();
      const { data, error } = await supabase
        .from('video_transcripts')
        .insert({
          id: transcriptId,
          project_id: projectId,
          user_id: userId,
          filename: file.name,
          video_url: uploadResult.videoUrl,
          storage_path: uploadResult.storagePath,
          file_size: file.size,
          content: transcripts,
          duration: duration
        })
        .select()
        .single();
        
      if (error) {
        console.error('Database error:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      return {
        id: data.id,
        filename: data.filename,
        videoUrl: data.video_url,
        storagePath: data.storage_path,
        fileSize: data.file_size,
        duration: data.duration,
        projectId: data.project_id,
        userId: data.user_id,
        content: data.content
      };
    } catch (error) {
      throw error;
    }
  }
}; 
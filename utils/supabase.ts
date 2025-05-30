import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Log warning if environment variables are missing in development
if (process.env.NODE_ENV === 'development') {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to initialize database tables if they don't exist
export const initializeSupabaseTables = async () => {
  try {
    // Check if projects table exists by attempting to select a single row
    const { error } = await supabase
      .from('projects')
      .select('id')
      .limit(1);
    
    // If we get a 404 error, the table doesn't exist
    if (error && (error.code === '404' || error.message?.includes('404'))) {
      console.log('Projects table not found. Please create the required tables in Supabase dashboard.');
      console.log('Using in-memory storage until database tables are created.');
      return false;
    }
    
    // Tables exist
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description?: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      video_transcripts: {
        Row: {
          id: string
          project_id: string
          filename: string
          content: Json
          duration?: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          filename: string
          content: Json
          duration?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          filename?: string
          content?: Json
          duration?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_notes: {
        Row: {
          id: string
          user_id: string
          project_id: string
          title?: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id: string
          title?: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string
          title?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      ai_chat_history: {
        Row: {
          id: string
          user_id: string
          project_id: string
          messages: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id: string
          messages: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string
          messages?: Json
          created_at?: string
          updated_at?: string
        }
      }
      kanban_board: {
        Row: {
          id: string
          user_id: string
          data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          data: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          data?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 
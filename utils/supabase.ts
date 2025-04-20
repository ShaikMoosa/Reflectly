import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
          name: string
          description: string
          created_at: string
          user_id: string
        }
        Insert: {
          id: string
          name: string
          description: string
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          created_at?: string
          user_id?: string
        }
      }
      transcripts: {
        Row: {
          id: string
          project_id: string
          segments: Json
          created_at: string
        }
        Insert: {
          id: string
          project_id: string
          segments: Json
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          segments?: Json
          created_at?: string
        }
      }
      whiteboard_data: {
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
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_chat_history: {
        Row: {
          created_at: string | null
          id: string
          messages: Json
          project_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          messages?: Json
          project_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          messages?: Json
          project_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_history_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      planner_columns: {
        Row: {
          column_order: number
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          column_order: number
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          column_order?: number
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_planner_columns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      planner_tasks: {
        Row: {
          column_id: string
          content: string
          created_at: string
          id: string
          task_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          column_id: string
          content: string
          created_at?: string
          id?: string
          task_order: number
          updated_at?: string
          user_id: string
        }
        Update: {
          column_id?: string
          content?: string
          created_at?: string
          id?: string
          task_order?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_planner_tasks_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "planner_columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_planner_tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_notes: {
        Row: {
          content: string
          created_at: string | null
          id: string
          project_id: string | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          project_id?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          project_id?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      video_transcripts: {
        Row: {
          content: Json
          created_at: string | null
          duration: number | null
          filename: string
          id: string
          project_id: string | null
          updated_at: string | null
        }
        Insert: {
          content?: Json
          created_at?: string | null
          duration?: number | null
          filename: string
          id?: string
          project_id?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          duration?: number | null
          filename?: string
          id?: string
          project_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_transcripts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          subscription_id: string
          plan_type: string
          status: string
          variant_id: string | null
          renews_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription_id: string
          plan_type: string
          status: string
          variant_id?: string | null
          renews_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subscription_id?: string
          plan_type?: string
          status?: string
          variant_id?: string | null
          renews_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_usage: {
        Row: {
          id: string
          user_id: string
          transcription_count: number
          ai_chat_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          transcription_count?: number
          ai_chat_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          transcription_count?: number
          ai_chat_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscription_cancellations: {
        Row: {
          id: string
          user_id: string
          subscription_id: string
          reason: string
          feedback: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription_id: string
          reason: string
          feedback?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subscription_id?: string
          reason?: string
          feedback?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_subscription"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["user_id"]
          }
        ]
      }
      admin_users: {
        Row: {
          id: string
          user_id: string
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_users_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      subscription_analytics: {
        Row: {
          date: string
          active_premium_count: number | null
          cancelled_count: number | null
          expired_count: number | null
          paused_count: number | null
          total_subscriptions: number
        }
      }
      cancellation_reasons_analytics: {
        Row: {
          reason: string
          count: number
          percentage: number
        }
      }
    }
    Functions: {
      update_updated_at_column: {
        Args: Record<string, never>
        Returns: unknown
      }
      increment_transcription_count: {
        Args: {
          user_id: string;
        }
        Returns: boolean
      }
      increment_ai_chat_count: {
        Args: {
          user_id: string;
        }
        Returns: boolean
      }
      check_usage_limits: {
        Args: {
          user_id: string;
          usage_type: string;
        }
        Returns: boolean
      }
      record_subscription_cancellation: {
        Args: {
          user_id: string
          subscription_id: string
          cancel_reason: string
          cancel_feedback?: string | null
        }
        Returns: boolean
      }
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      add_admin_user: {
        Args: {
          admin_user_id: string
          target_user_id: string
        }
        Returns: boolean
      }
      remove_admin_user: {
        Args: {
          admin_user_id: string
          target_user_id: string
        }
        Returns: boolean
      }
      reset_monthly_usage: {
        Args: Record<string, never>
        Returns: void
      }
      get_subscription_metrics: {
        Args: Record<string, never>
        Returns: {
          metric_name: string
          metric_value: number
        }[]
      }
      export_subscription_data: {
        Args: {
          days?: number
        }
        Returns: {
          user_id: string
          subscription_id: string
          plan_type: string
          status: string
          created_at: string
          renewed_at: string
          transcription_count: number
          ai_chat_count: number
          cancellation_reason: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

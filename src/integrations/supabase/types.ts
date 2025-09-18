export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          created_at: string
          duration: number
          id: string
          meeting_link: string | null
          mentee_id: string
          mentor_id: string
          notes: string | null
          package_type: string | null
          payment_status: string | null
          price: number
          session_date: string
          session_time: string
          session_type: string | null
          status: string | null
          topic: string | null
        }
        Insert: {
          created_at?: string
          duration?: number
          id?: string
          meeting_link?: string | null
          mentee_id: string
          mentor_id: string
          notes?: string | null
          package_type?: string | null
          payment_status?: string | null
          price: number
          session_date: string
          session_time: string
          session_type?: string | null
          status?: string | null
          topic?: string | null
        }
        Update: {
          created_at?: string
          duration?: number
          id?: string
          meeting_link?: string | null
          mentee_id?: string
          mentor_id?: string
          notes?: string | null
          package_type?: string | null
          payment_status?: string | null
          price?: number
          session_date?: string
          session_time?: string
          session_type?: string | null
          status?: string | null
          topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      call_sessions: {
        Row: {
          booking_id: string
          call_type: string
          callee_id: string
          caller_id: string
          created_at: string | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          recording_url: string | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          booking_id: string
          call_type: string
          callee_id: string
          caller_id: string
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          recording_url?: string | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          booking_id?: string
          call_type?: string
          callee_id?: string
          caller_id?: string
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          recording_url?: string | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_sessions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_availability: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean | null
          mentor_id: string
          start_time: string
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean | null
          mentor_id: string
          start_time: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean | null
          mentor_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_availability_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
        ]
      }
      mentors: {
        Row: {
          availability_status: string | null
          bio: string | null
          cancellation_policy: string | null
          created_at: string
          expertise: string[] | null
          hourly_rate: number | null
          id: string
          is_verified: boolean | null
          languages: string[] | null
          name: string
          profile_image_url: string | null
          rating: number | null
          response_time_hours: number | null
          session_types: string[] | null
          title: string
          total_reviews: number | null
          updated_at: string
          user_id: string | null
          video_intro_url: string | null
          years_experience: number | null
        }
        Insert: {
          availability_status?: string | null
          bio?: string | null
          cancellation_policy?: string | null
          created_at?: string
          expertise?: string[] | null
          hourly_rate?: number | null
          id?: string
          is_verified?: boolean | null
          languages?: string[] | null
          name: string
          profile_image_url?: string | null
          rating?: number | null
          response_time_hours?: number | null
          session_types?: string[] | null
          title: string
          total_reviews?: number | null
          updated_at?: string
          user_id?: string | null
          video_intro_url?: string | null
          years_experience?: number | null
        }
        Update: {
          availability_status?: string | null
          bio?: string | null
          cancellation_policy?: string | null
          created_at?: string
          expertise?: string[] | null
          hourly_rate?: number | null
          id?: string
          is_verified?: boolean | null
          languages?: string[] | null
          name?: string
          profile_image_url?: string | null
          rating?: number | null
          response_time_hours?: number | null
          session_types?: string[] | null
          title?: string
          total_reviews?: number | null
          updated_at?: string
          user_id?: string | null
          video_intro_url?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          message_type: string | null
          recipient_id: string
          sender_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          recipient_id: string
          sender_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          recipient_id?: string
          sender_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string
          created_at: string | null
          id: string
          is_public: boolean | null
          mentor_id: string
          rating: number
          review_text: string | null
          reviewer_id: string
          updated_at: string | null
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          mentor_id: string
          rating: number
          review_text?: string | null
          reviewer_id: string
          updated_at?: string | null
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          mentor_id?: string
          rating?: number
          review_text?: string | null
          reviewer_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar: string | null
          bio: string | null
          company: string | null
          created_at: string | null
          current_level: string | null
          education: string | null
          email: string
          experience: string | null
          expertise: string[] | null
          first_name: string
          github_url: string | null
          goals: string | null
          hourly_rate: number | null
          id: string
          interests: string[] | null
          is_active: boolean | null
          last_active_at: string | null
          last_name: string
          linkedin_url: string | null
          phone: string | null
          portfolio_url: string | null
          profile_complete: boolean | null
          profile_image_url: string | null
          rating: number | null
          role: string | null
          timezone: string | null
          total_sessions: number | null
          user_type: string
          verified: boolean | null
        }
        Insert: {
          avatar?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          current_level?: string | null
          education?: string | null
          email: string
          experience?: string | null
          expertise?: string[] | null
          first_name: string
          github_url?: string | null
          goals?: string | null
          hourly_rate?: number | null
          id?: string
          interests?: string[] | null
          is_active?: boolean | null
          last_active_at?: string | null
          last_name: string
          linkedin_url?: string | null
          phone?: string | null
          portfolio_url?: string | null
          profile_complete?: boolean | null
          profile_image_url?: string | null
          rating?: number | null
          role?: string | null
          timezone?: string | null
          total_sessions?: number | null
          user_type: string
          verified?: boolean | null
        }
        Update: {
          avatar?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          current_level?: string | null
          education?: string | null
          email?: string
          experience?: string | null
          expertise?: string[] | null
          first_name?: string
          github_url?: string | null
          goals?: string | null
          hourly_rate?: number | null
          id?: string
          interests?: string[] | null
          is_active?: boolean | null
          last_active_at?: string | null
          last_name?: string
          linkedin_url?: string | null
          phone?: string | null
          portfolio_url?: string | null
          profile_complete?: boolean | null
          profile_image_url?: string | null
          rating?: number | null
          role?: string | null
          timezone?: string | null
          total_sessions?: number | null
          user_type?: string
          verified?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

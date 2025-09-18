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
      mentor_sessions: {
        Row: {
          created_at: string
          duration_minutes: number | null
          ended_at: string | null
          id: string
          mentor_id: string
          price: number | null
          scheduled_at: string | null
          session_room_id: string | null
          session_type: string
          started_at: string | null
          status: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          mentor_id: string
          price?: number | null
          scheduled_at?: string | null
          session_room_id?: string | null
          session_type: string
          started_at?: string | null
          status?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          mentor_id?: string
          price?: number | null
          scheduled_at?: string | null
          session_room_id?: string | null
          session_type?: string
          started_at?: string | null
          status?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_sessions_mentor_id_fkey"
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
          created_at: string
          expertise: string[] | null
          hourly_rate: number | null
          id: string
          is_verified: boolean | null
          languages: string[] | null
          name: string
          profile_image_url: string | null
          rating: number | null
          title: string
          total_reviews: number | null
          updated_at: string
          user_id: string | null
          years_experience: number | null
        }
        Insert: {
          availability_status?: string | null
          bio?: string | null
          created_at?: string
          expertise?: string[] | null
          hourly_rate?: number | null
          id?: string
          is_verified?: boolean | null
          languages?: string[] | null
          name: string
          profile_image_url?: string | null
          rating?: number | null
          title: string
          total_reviews?: number | null
          updated_at?: string
          user_id?: string | null
          years_experience?: number | null
        }
        Update: {
          availability_status?: string | null
          bio?: string | null
          created_at?: string
          expertise?: string[] | null
          hourly_rate?: number | null
          id?: string
          is_verified?: boolean | null
          languages?: string[] | null
          name?: string
          profile_image_url?: string | null
          rating?: number | null
          title?: string
          total_reviews?: number | null
          updated_at?: string
          user_id?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      sessions: {
        Row: {
          created_at: string | null
          duration: number | null
          feedback: string | null
          id: string
          meeting_type: string | null
          mentee_id: string | null
          mentor_id: string | null
          rating: number | null
          scheduled_at: string
          status: string | null
          topic: string
        }
        Insert: {
          created_at?: string | null
          duration?: number | null
          feedback?: string | null
          id?: string
          meeting_type?: string | null
          mentee_id?: string | null
          mentor_id?: string | null
          rating?: number | null
          scheduled_at: string
          status?: string | null
          topic: string
        }
        Update: {
          created_at?: string | null
          duration?: number | null
          feedback?: string | null
          id?: string
          meeting_type?: string | null
          mentee_id?: string | null
          mentor_id?: string | null
          rating?: number | null
          scheduled_at?: string
          status?: string | null
          topic?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "users"
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
          goals: string | null
          hourly_rate: number | null
          id: string
          interests: string[] | null
          last_name: string
          phone: string | null
          profile_complete: boolean | null
          rating: number | null
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
          goals?: string | null
          hourly_rate?: number | null
          id?: string
          interests?: string[] | null
          last_name: string
          phone?: string | null
          profile_complete?: boolean | null
          rating?: number | null
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
          goals?: string | null
          hourly_rate?: number | null
          id?: string
          interests?: string[] | null
          last_name?: string
          phone?: string | null
          profile_complete?: boolean | null
          rating?: number | null
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

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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      classes: {
        Row: {
          academic_year: string | null
          capacity: number | null
          class_name: string
          class_teacher_id: string | null
          created_at: string | null
          display_order: number | null
          id: string
          institution_id: string
          room_number: string | null
          section: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          academic_year?: string | null
          capacity?: number | null
          class_name: string
          class_teacher_id?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          institution_id: string
          room_number?: string | null
          section?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          academic_year?: string | null
          capacity?: number | null
          class_name?: string
          class_teacher_id?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          institution_id?: string
          room_number?: string | null
          section?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      id_counters: {
        Row: {
          counter_padding: number | null
          created_at: string
          current_counter: number
          entity_type: string
          id: string
          institution_id: string
          prefix: string | null
          updated_at: string
          year_format: string | null
        }
        Insert: {
          counter_padding?: number | null
          created_at?: string
          current_counter?: number
          entity_type: string
          id?: string
          institution_id: string
          prefix?: string | null
          updated_at?: string
          year_format?: string | null
        }
        Update: {
          counter_padding?: number | null
          created_at?: string
          current_counter?: number
          entity_type?: string
          id?: string
          institution_id?: string
          prefix?: string | null
          updated_at?: string
          year_format?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "id_counters_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_periods: {
        Row: {
          created_at: string
          display_order: number
          end_time: string
          id: string
          institution_id: string
          is_break: boolean
          label: string
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          end_time: string
          id?: string
          institution_id: string
          is_break?: boolean
          label: string
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          end_time?: string
          id?: string
          institution_id?: string
          is_break?: boolean
          label?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "institution_periods_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_timetable_assignments: {
        Row: {
          academic_year: string
          class_id: string
          class_name: string
          created_at: string
          day: string
          id: string
          institution_id: string
          period_id: string
          room: string | null
          subject: string
          teacher_id: string | null
          teacher_name: string | null
          updated_at: string
        }
        Insert: {
          academic_year?: string
          class_id: string
          class_name: string
          created_at?: string
          day: string
          id?: string
          institution_id: string
          period_id: string
          room?: string | null
          subject: string
          teacher_id?: string | null
          teacher_name?: string | null
          updated_at?: string
        }
        Update: {
          academic_year?: string
          class_id?: string
          class_name?: string
          created_at?: string
          day?: string
          id?: string
          institution_id?: string
          period_id?: string
          room?: string | null
          subject?: string
          teacher_id?: string | null
          teacher_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "institution_timetable_assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_timetable_assignments_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_timetable_assignments_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "institution_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          address: Json | null
          code: string | null
          contact_info: Json | null
          created_at: string | null
          id: string
          name: string
          settings: Json | null
          slug: string
          status: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          address?: Json | null
          code?: string | null
          contact_info?: Json | null
          created_at?: string | null
          id?: string
          name: string
          settings?: Json | null
          slug: string
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: Json | null
          code?: string | null
          contact_info?: Json | null
          created_at?: string | null
          id?: string
          name?: string
          settings?: Json | null
          slug?: string
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string | null
          class_id: string | null
          created_at: string | null
          email: string
          hourly_rate: number | null
          id: string
          institution_id: string | null
          is_ceo: boolean | null
          must_change_password: boolean | null
          name: string
          normal_working_hours: number | null
          overtime_rate_multiplier: number | null
          password_changed: boolean | null
          password_changed_at: string | null
          position_id: string | null
          position_name: string | null
          updated_at: string | null
        }
        Insert: {
          avatar?: string | null
          class_id?: string | null
          created_at?: string | null
          email: string
          hourly_rate?: number | null
          id: string
          institution_id?: string | null
          is_ceo?: boolean | null
          must_change_password?: boolean | null
          name: string
          normal_working_hours?: number | null
          overtime_rate_multiplier?: number | null
          password_changed?: boolean | null
          password_changed_at?: string | null
          position_id?: string | null
          position_name?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar?: string | null
          class_id?: string | null
          created_at?: string | null
          email?: string
          hourly_rate?: number | null
          id?: string
          institution_id?: string | null
          is_ceo?: boolean | null
          must_change_password?: boolean | null
          name?: string
          normal_working_hours?: number | null
          overtime_rate_multiplier?: number | null
          password_changed?: boolean | null
          password_changed_at?: string | null
          position_id?: string | null
          position_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          address: string | null
          admission_date: string | null
          admission_number: string | null
          avatar: string | null
          blood_group: string | null
          class_id: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          gender: string | null
          id: string
          institution_id: string
          parent_email: string | null
          parent_name: string | null
          parent_phone: string | null
          previous_school: string | null
          roll_number: string | null
          status: string | null
          student_id: string
          student_name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          admission_date?: string | null
          admission_number?: string | null
          avatar?: string | null
          blood_group?: string | null
          class_id?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          institution_id: string
          parent_email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          previous_school?: string | null
          roll_number?: string | null
          status?: string | null
          student_id: string
          student_name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          admission_date?: string | null
          admission_number?: string | null
          avatar?: string | null
          blood_group?: string | null
          class_id?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          institution_id?: string
          parent_email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          previous_school?: string | null
          roll_number?: string | null
          status?: string | null
          student_id?: string
          student_name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_next_id: {
        Args: { p_entity_type: string; p_institution_id: string }
        Returns: number
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      reserve_id_range: {
        Args: {
          p_count: number
          p_entity_type: string
          p_institution_id: string
        }
        Returns: {
          end_counter: number
          start_counter: number
        }[]
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "system_admin"
        | "management"
        | "officer"
        | "teacher"
        | "student"
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
    Enums: {
      app_role: [
        "super_admin",
        "system_admin",
        "management",
        "officer",
        "teacher",
        "student",
      ],
    },
  },
} as const

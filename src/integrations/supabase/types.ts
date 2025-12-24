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
      course_class_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          class_id: string
          course_id: string
          id: string
          institution_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          class_id: string
          course_id: string
          id?: string
          institution_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          class_id?: string
          course_id?: string
          id?: string
          institution_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_class_assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_class_assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_class_assignments_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      course_content: {
        Row: {
          course_id: string
          created_at: string
          display_order: number
          duration_minutes: number | null
          file_path: string | null
          file_size_mb: number | null
          id: string
          module_id: string
          session_id: string
          title: string
          type: string
          views_count: number | null
          youtube_url: string | null
        }
        Insert: {
          course_id: string
          created_at?: string
          display_order?: number
          duration_minutes?: number | null
          file_path?: string | null
          file_size_mb?: number | null
          id?: string
          module_id: string
          session_id: string
          title: string
          type: string
          views_count?: number | null
          youtube_url?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string
          display_order?: number
          duration_minutes?: number | null
          file_path?: string | null
          file_size_mb?: number | null
          id?: string
          module_id?: string
          session_id?: string
          title?: string
          type?: string
          views_count?: number | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_content_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_content_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_content_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "course_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      course_institution_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          course_id: string
          id: string
          institution_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          course_id: string
          id?: string
          institution_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          course_id?: string
          id?: string
          institution_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_institution_assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_institution_assignments_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          certificate_template_id: string | null
          course_id: string
          created_at: string
          description: string | null
          display_order: number
          id: string
          title: string
        }
        Insert: {
          certificate_template_id?: string | null
          course_id: string
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          title: string
        }
        Update: {
          certificate_template_id?: string | null
          course_id?: string
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_sessions: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          display_order: number
          duration_minutes: number | null
          id: string
          learning_objectives: Json | null
          module_id: string
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          display_order?: number
          duration_minutes?: number | null
          id?: string
          learning_objectives?: Json | null
          module_id: string
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          display_order?: number
          duration_minutes?: number | null
          id?: string
          learning_objectives?: Json | null
          module_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_sessions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string
          certificate_template_id: string | null
          course_code: string
          created_at: string
          created_by: string | null
          description: string | null
          difficulty: string
          duration_weeks: number | null
          id: string
          learning_outcomes: Json | null
          prerequisites: string | null
          sdg_goals: Json | null
          status: string
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          certificate_template_id?: string | null
          course_code: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: string
          duration_weeks?: number | null
          id?: string
          learning_outcomes?: Json | null
          prerequisites?: string | null
          sdg_goals?: Json | null
          status?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          certificate_template_id?: string | null
          course_code?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: string
          duration_weeks?: number | null
          id?: string
          learning_outcomes?: Json | null
          prerequisites?: string | null
          sdg_goals?: Json | null
          status?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
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
          admin_user_id: string | null
          code: string | null
          contact_info: Json | null
          contract_expiry_date: string | null
          contract_value: number | null
          created_at: string | null
          current_users: number | null
          id: string
          license_expiry: string | null
          license_type: string | null
          max_users: number | null
          name: string
          settings: Json | null
          slug: string
          status: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          address?: Json | null
          admin_user_id?: string | null
          code?: string | null
          contact_info?: Json | null
          contract_expiry_date?: string | null
          contract_value?: number | null
          created_at?: string | null
          current_users?: number | null
          id?: string
          license_expiry?: string | null
          license_type?: string | null
          max_users?: number | null
          name: string
          settings?: Json | null
          slug: string
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: Json | null
          admin_user_id?: string | null
          code?: string | null
          contact_info?: Json | null
          contract_expiry_date?: string | null
          contract_value?: number | null
          created_at?: string | null
          current_users?: number | null
          id?: string
          license_expiry?: string | null
          license_type?: string | null
          max_users?: number | null
          name?: string
          settings?: Json | null
          slug?: string
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      officer_documents: {
        Row: {
          created_at: string | null
          description: string | null
          document_name: string
          document_type: string
          file_size_mb: number | null
          file_type: string | null
          file_url: string
          id: string
          officer_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          document_name: string
          document_type: string
          file_size_mb?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          officer_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          document_name?: string
          document_type?: string
          file_size_mb?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          officer_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "officer_documents_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
        ]
      }
      officers: {
        Row: {
          address: string | null
          annual_leave_allowance: number | null
          annual_salary: number
          assigned_institutions: string[] | null
          bank_account_number: string | null
          bank_branch: string | null
          bank_ifsc: string | null
          bank_name: string | null
          casual_leave_allowance: number | null
          certifications: Json | null
          created_at: string | null
          date_of_birth: string | null
          department: string | null
          email: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          employee_id: string | null
          employment_type: string
          full_name: string
          hourly_rate: number | null
          id: string
          join_date: string | null
          normal_working_hours: number | null
          overtime_rate_multiplier: number | null
          phone: string | null
          profile_photo_url: string | null
          qualifications: Json | null
          salary_structure: Json | null
          sick_leave_allowance: number | null
          skills: Json | null
          status: string
          statutory_info: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          annual_leave_allowance?: number | null
          annual_salary?: number
          assigned_institutions?: string[] | null
          bank_account_number?: string | null
          bank_branch?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          casual_leave_allowance?: number | null
          certifications?: Json | null
          created_at?: string | null
          date_of_birth?: string | null
          department?: string | null
          email: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_id?: string | null
          employment_type?: string
          full_name: string
          hourly_rate?: number | null
          id?: string
          join_date?: string | null
          normal_working_hours?: number | null
          overtime_rate_multiplier?: number | null
          phone?: string | null
          profile_photo_url?: string | null
          qualifications?: Json | null
          salary_structure?: Json | null
          sick_leave_allowance?: number | null
          skills?: Json | null
          status?: string
          statutory_info?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          annual_leave_allowance?: number | null
          annual_salary?: number
          assigned_institutions?: string[] | null
          bank_account_number?: string | null
          bank_branch?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          casual_leave_allowance?: number | null
          certifications?: Json | null
          created_at?: string | null
          date_of_birth?: string | null
          department?: string | null
          email?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_id?: string | null
          employment_type?: string
          full_name?: string
          hourly_rate?: number | null
          id?: string
          join_date?: string | null
          normal_working_hours?: number | null
          overtime_rate_multiplier?: number | null
          phone?: string | null
          profile_photo_url?: string | null
          qualifications?: Json | null
          salary_structure?: Json | null
          sick_leave_allowance?: number | null
          skills?: Json | null
          status?: string
          statutory_info?: Json | null
          updated_at?: string | null
          user_id?: string | null
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
      get_user_institution_id: { Args: { _user_id: string }; Returns: string }
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

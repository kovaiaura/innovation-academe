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
      class_module_assignments: {
        Row: {
          class_assignment_id: string
          created_at: string | null
          id: string
          is_unlocked: boolean | null
          module_id: string
          unlock_mode: string | null
          unlock_order: number | null
          updated_at: string | null
        }
        Insert: {
          class_assignment_id: string
          created_at?: string | null
          id?: string
          is_unlocked?: boolean | null
          module_id: string
          unlock_mode?: string | null
          unlock_order?: number | null
          updated_at?: string | null
        }
        Update: {
          class_assignment_id?: string
          created_at?: string | null
          id?: string
          is_unlocked?: boolean | null
          module_id?: string
          unlock_mode?: string | null
          unlock_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_module_assignments_class_assignment_id_fkey"
            columns: ["class_assignment_id"]
            isOneToOne: false
            referencedRelation: "course_class_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_module_assignments_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      class_session_assignments: {
        Row: {
          class_module_assignment_id: string
          created_at: string | null
          id: string
          is_unlocked: boolean | null
          session_id: string
          unlock_mode: string | null
          unlock_order: number | null
          updated_at: string | null
        }
        Insert: {
          class_module_assignment_id: string
          created_at?: string | null
          id?: string
          is_unlocked?: boolean | null
          session_id: string
          unlock_mode?: string | null
          unlock_order?: number | null
          updated_at?: string | null
        }
        Update: {
          class_module_assignment_id?: string
          created_at?: string | null
          id?: string
          is_unlocked?: boolean | null
          session_id?: string
          unlock_mode?: string | null
          unlock_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_session_assignments_class_module_assignment_id_fkey"
            columns: ["class_module_assignment_id"]
            isOneToOne: false
            referencedRelation: "class_module_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_session_assignments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "course_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      class_session_attendance: {
        Row: {
          attendance_records: Json | null
          class_id: string
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          date: string
          id: string
          institution_id: string
          is_session_completed: boolean | null
          notes: string | null
          officer_id: string | null
          period_label: string | null
          period_time: string | null
          students_absent: number
          students_late: number
          students_present: number
          subject: string | null
          timetable_assignment_id: string
          total_students: number
          updated_at: string | null
        }
        Insert: {
          attendance_records?: Json | null
          class_id: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          date: string
          id?: string
          institution_id: string
          is_session_completed?: boolean | null
          notes?: string | null
          officer_id?: string | null
          period_label?: string | null
          period_time?: string | null
          students_absent?: number
          students_late?: number
          students_present?: number
          subject?: string | null
          timetable_assignment_id: string
          total_students?: number
          updated_at?: string | null
        }
        Update: {
          attendance_records?: Json | null
          class_id?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          date?: string
          id?: string
          institution_id?: string
          is_session_completed?: boolean | null
          notes?: string | null
          officer_id?: string | null
          period_label?: string | null
          period_time?: string | null
          students_absent?: number
          students_late?: number
          students_present?: number
          subject?: string | null
          timetable_assignment_id?: string
          total_students?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_session_attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_session_attendance_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_session_attendance_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_session_attendance_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_session_attendance_timetable_assignment_id_fkey"
            columns: ["timetable_assignment_id"]
            isOneToOne: false
            referencedRelation: "institution_timetable_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
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
      company_holidays: {
        Row: {
          created_at: string | null
          created_by: string | null
          date: string
          description: string | null
          end_date: string | null
          holiday_type: string
          id: string
          is_paid: boolean | null
          name: string
          updated_at: string | null
          year: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          date: string
          description?: string | null
          end_date?: string | null
          holiday_type?: string
          id?: string
          is_paid?: boolean | null
          name: string
          updated_at?: string | null
          year: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          date?: string
          description?: string | null
          end_date?: string | null
          holiday_type?: string
          id?: string
          is_paid?: boolean | null
          name?: string
          updated_at?: string | null
          year?: number
        }
        Relationships: []
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
      institution_holidays: {
        Row: {
          created_at: string | null
          created_by: string | null
          date: string
          description: string | null
          end_date: string | null
          holiday_type: string
          id: string
          institution_id: string
          is_paid: boolean | null
          name: string
          updated_at: string | null
          year: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          date: string
          description?: string | null
          end_date?: string | null
          holiday_type?: string
          id?: string
          institution_id: string
          is_paid?: boolean | null
          name: string
          updated_at?: string | null
          year: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          date?: string
          description?: string | null
          end_date?: string | null
          holiday_type?: string
          id?: string
          institution_id?: string
          is_paid?: boolean | null
          name?: string
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "institution_holidays_institution_id_fkey"
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
          backup_officer_id: string | null
          backup_officer_name: string | null
          class_id: string
          class_name: string
          created_at: string
          day: string
          id: string
          institution_id: string
          period_id: string
          room: string | null
          secondary_officer_id: string | null
          secondary_officer_name: string | null
          subject: string
          teacher_id: string | null
          teacher_name: string | null
          updated_at: string
        }
        Insert: {
          academic_year?: string
          backup_officer_id?: string | null
          backup_officer_name?: string | null
          class_id: string
          class_name: string
          created_at?: string
          day: string
          id?: string
          institution_id: string
          period_id: string
          room?: string | null
          secondary_officer_id?: string | null
          secondary_officer_name?: string | null
          subject: string
          teacher_id?: string | null
          teacher_name?: string | null
          updated_at?: string
        }
        Update: {
          academic_year?: string
          backup_officer_id?: string | null
          backup_officer_name?: string | null
          class_id?: string
          class_name?: string
          created_at?: string
          day?: string
          id?: string
          institution_id?: string
          period_id?: string
          room?: string | null
          secondary_officer_id?: string | null
          secondary_officer_name?: string | null
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
      leave_applications: {
        Row: {
          applicant_id: string
          applicant_name: string
          applicant_type: string
          applied_at: string | null
          approval_chain: Json | null
          current_approval_level: number | null
          end_date: string
          final_approved_at: string | null
          final_approved_by: string | null
          final_approved_by_name: string | null
          id: string
          institution_id: string | null
          institution_name: string | null
          is_lop: boolean | null
          leave_type: string
          lop_days: number | null
          officer_id: string | null
          paid_days: number | null
          position_id: string | null
          position_name: string | null
          reason: string
          rejected_at: string | null
          rejected_by: string | null
          rejected_by_name: string | null
          rejection_reason: string | null
          start_date: string
          status: string
          substitute_assignments: Json | null
          total_days: number
          updated_at: string | null
        }
        Insert: {
          applicant_id: string
          applicant_name: string
          applicant_type: string
          applied_at?: string | null
          approval_chain?: Json | null
          current_approval_level?: number | null
          end_date: string
          final_approved_at?: string | null
          final_approved_by?: string | null
          final_approved_by_name?: string | null
          id?: string
          institution_id?: string | null
          institution_name?: string | null
          is_lop?: boolean | null
          leave_type: string
          lop_days?: number | null
          officer_id?: string | null
          paid_days?: number | null
          position_id?: string | null
          position_name?: string | null
          reason: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejected_by_name?: string | null
          rejection_reason?: string | null
          start_date: string
          status?: string
          substitute_assignments?: Json | null
          total_days: number
          updated_at?: string | null
        }
        Update: {
          applicant_id?: string
          applicant_name?: string
          applicant_type?: string
          applied_at?: string | null
          approval_chain?: Json | null
          current_approval_level?: number | null
          end_date?: string
          final_approved_at?: string | null
          final_approved_by?: string | null
          final_approved_by_name?: string | null
          id?: string
          institution_id?: string | null
          institution_name?: string | null
          is_lop?: boolean | null
          leave_type?: string
          lop_days?: number | null
          officer_id?: string | null
          paid_days?: number | null
          position_id?: string | null
          position_name?: string | null
          reason?: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejected_by_name?: string | null
          rejection_reason?: string | null
          start_date?: string
          status?: string
          substitute_assignments?: Json | null
          total_days?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leave_applications_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_applications_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_applications_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_approval_hierarchy: {
        Row: {
          applicant_position_id: string | null
          applicant_type: string
          approval_order: number
          approver_position_id: string
          created_at: string | null
          id: string
          is_final_approver: boolean | null
          is_optional: boolean | null
          updated_at: string | null
        }
        Insert: {
          applicant_position_id?: string | null
          applicant_type: string
          approval_order: number
          approver_position_id: string
          created_at?: string | null
          id?: string
          is_final_approver?: boolean | null
          is_optional?: boolean | null
          updated_at?: string | null
        }
        Update: {
          applicant_position_id?: string | null
          applicant_type?: string
          approval_order?: number
          approver_position_id?: string
          created_at?: string | null
          id?: string
          is_final_approver?: boolean | null
          is_optional?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leave_approval_hierarchy_applicant_position_id_fkey"
            columns: ["applicant_position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_approval_hierarchy_approver_position_id_fkey"
            columns: ["approver_position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_balances: {
        Row: {
          balance_remaining: number
          carried_forward: number
          casual_leave_used: number
          created_at: string | null
          id: string
          lop_days: number
          month: number
          monthly_credit: number
          officer_id: string | null
          sick_leave_used: number
          updated_at: string | null
          user_id: string
          user_type: string
          year: number
        }
        Insert: {
          balance_remaining?: number
          carried_forward?: number
          casual_leave_used?: number
          created_at?: string | null
          id?: string
          lop_days?: number
          month: number
          monthly_credit?: number
          officer_id?: string | null
          sick_leave_used?: number
          updated_at?: string | null
          user_id: string
          user_type: string
          year: number
        }
        Update: {
          balance_remaining?: number
          carried_forward?: number
          casual_leave_used?: number
          created_at?: string | null
          id?: string
          lop_days?: number
          month?: number
          monthly_credit?: number
          officer_id?: string | null
          sick_leave_used?: number
          updated_at?: string | null
          user_id?: string
          user_type?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "leave_balances_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          link: string | null
          message: string
          metadata: Json | null
          read: boolean | null
          recipient_id: string
          recipient_role: string
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          link?: string | null
          message: string
          metadata?: Json | null
          read?: boolean | null
          recipient_id: string
          recipient_role: string
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          link?: string | null
          message?: string
          metadata?: Json | null
          read?: boolean | null
          recipient_id?: string
          recipient_role?: string
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      officer_attendance: {
        Row: {
          check_in_address: string | null
          check_in_distance_meters: number | null
          check_in_latitude: number | null
          check_in_longitude: number | null
          check_in_time: string | null
          check_in_validated: boolean | null
          check_out_address: string | null
          check_out_distance_meters: number | null
          check_out_latitude: number | null
          check_out_longitude: number | null
          check_out_time: string | null
          check_out_validated: boolean | null
          created_at: string | null
          date: string
          id: string
          institution_id: string
          notes: string | null
          officer_id: string
          overtime_hours: number | null
          status: string | null
          total_hours_worked: number | null
          updated_at: string | null
        }
        Insert: {
          check_in_address?: string | null
          check_in_distance_meters?: number | null
          check_in_latitude?: number | null
          check_in_longitude?: number | null
          check_in_time?: string | null
          check_in_validated?: boolean | null
          check_out_address?: string | null
          check_out_distance_meters?: number | null
          check_out_latitude?: number | null
          check_out_longitude?: number | null
          check_out_time?: string | null
          check_out_validated?: boolean | null
          created_at?: string | null
          date?: string
          id?: string
          institution_id: string
          notes?: string | null
          officer_id: string
          overtime_hours?: number | null
          status?: string | null
          total_hours_worked?: number | null
          updated_at?: string | null
        }
        Update: {
          check_in_address?: string | null
          check_in_distance_meters?: number | null
          check_in_latitude?: number | null
          check_in_longitude?: number | null
          check_in_time?: string | null
          check_in_validated?: boolean | null
          check_out_address?: string | null
          check_out_distance_meters?: number | null
          check_out_latitude?: number | null
          check_out_longitude?: number | null
          check_out_time?: string | null
          check_out_validated?: boolean | null
          created_at?: string | null
          date?: string
          id?: string
          institution_id?: string
          notes?: string | null
          officer_id?: string
          overtime_hours?: number | null
          status?: string | null
          total_hours_worked?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "officer_attendance_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "officer_attendance_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
        ]
      }
      officer_class_access_grants: {
        Row: {
          access_type: string
          class_id: string
          created_at: string | null
          granting_officer_id: string
          id: string
          institution_id: string
          is_active: boolean | null
          reason: string | null
          receiving_officer_id: string
          timetable_assignment_id: string | null
          updated_at: string | null
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          access_type?: string
          class_id: string
          created_at?: string | null
          granting_officer_id: string
          id?: string
          institution_id: string
          is_active?: boolean | null
          reason?: string | null
          receiving_officer_id: string
          timetable_assignment_id?: string | null
          updated_at?: string | null
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          access_type?: string
          class_id?: string
          created_at?: string | null
          granting_officer_id?: string
          id?: string
          institution_id?: string
          is_active?: boolean | null
          reason?: string | null
          receiving_officer_id?: string
          timetable_assignment_id?: string | null
          updated_at?: string | null
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_class"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_granting_officer"
            columns: ["granting_officer_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_institution"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_receiving_officer"
            columns: ["receiving_officer_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_timetable_assignment"
            columns: ["timetable_assignment_id"]
            isOneToOne: false
            referencedRelation: "institution_timetable_assignments"
            referencedColumns: ["id"]
          },
        ]
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
      positions: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          display_name: string
          id: string
          is_ceo_position: boolean
          position_name: string
          updated_at: string | null
          visible_features: Json
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_ceo_position?: boolean
          position_name: string
          updated_at?: string | null
          visible_features?: Json
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_ceo_position?: boolean
          position_name?: string
          updated_at?: string | null
          visible_features?: Json
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
          join_date: string | null
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
          join_date?: string | null
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
          join_date?: string | null
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
      project_achievements: {
        Row: {
          added_by_officer_id: string | null
          certificate_url: string | null
          created_at: string | null
          description: string | null
          event_date: string | null
          event_name: string | null
          id: string
          project_id: string
          title: string
          type: string
        }
        Insert: {
          added_by_officer_id?: string | null
          certificate_url?: string | null
          created_at?: string | null
          description?: string | null
          event_date?: string | null
          event_name?: string | null
          id?: string
          project_id: string
          title: string
          type?: string
        }
        Update: {
          added_by_officer_id?: string | null
          certificate_url?: string | null
          created_at?: string | null
          description?: string | null
          event_date?: string | null
          event_name?: string | null
          id?: string
          project_id?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_achievements_added_by_officer_id_fkey"
            columns: ["added_by_officer_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_achievements_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          assigned_at: string | null
          assigned_by_officer_id: string | null
          id: string
          project_id: string
          role: string
          student_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by_officer_id?: string | null
          id?: string
          project_id: string
          role?: string
          student_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by_officer_id?: string | null
          id?: string
          project_id?: string
          role?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_assigned_by_officer_id_fkey"
            columns: ["assigned_by_officer_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      project_progress_updates: {
        Row: {
          attachment_urls: Json | null
          created_at: string | null
          id: string
          notes: string
          progress_percentage: number | null
          project_id: string
          updated_by_officer_id: string | null
          updated_by_officer_name: string
        }
        Insert: {
          attachment_urls?: Json | null
          created_at?: string | null
          id?: string
          notes: string
          progress_percentage?: number | null
          project_id: string
          updated_by_officer_id?: string | null
          updated_by_officer_name: string
        }
        Update: {
          attachment_urls?: Json | null
          created_at?: string | null
          id?: string
          notes?: string
          progress_percentage?: number | null
          project_id?: string
          updated_by_officer_id?: string | null
          updated_by_officer_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_progress_updates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_progress_updates_updated_by_officer_id_fkey"
            columns: ["updated_by_officer_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          actual_completion_date: string | null
          category: string
          created_at: string | null
          created_by_officer_id: string
          created_by_officer_name: string
          description: string | null
          id: string
          institution_id: string
          is_published: boolean | null
          is_showcase: boolean | null
          progress: number | null
          remarks: string | null
          sdg_goals: Json | null
          showcase_image_url: string | null
          start_date: string | null
          status: string
          target_completion_date: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_completion_date?: string | null
          category?: string
          created_at?: string | null
          created_by_officer_id: string
          created_by_officer_name: string
          description?: string | null
          id?: string
          institution_id: string
          is_published?: boolean | null
          is_showcase?: boolean | null
          progress?: number | null
          remarks?: string | null
          sdg_goals?: Json | null
          showcase_image_url?: string | null
          start_date?: string | null
          status?: string
          target_completion_date?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_completion_date?: string | null
          category?: string
          created_at?: string | null
          created_by_officer_id?: string
          created_by_officer_name?: string
          description?: string | null
          id?: string
          institution_id?: string
          is_published?: boolean | null
          is_showcase?: boolean | null
          progress?: number | null
          remarks?: string | null
          sdg_goals?: Json | null
          showcase_image_url?: string | null
          start_date?: string | null
          status?: string
          target_completion_date?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_created_by_officer_id_fkey"
            columns: ["created_by_officer_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      student_content_completions: {
        Row: {
          class_assignment_id: string
          completed_at: string | null
          content_id: string
          id: string
          student_id: string
          watch_percentage: number | null
        }
        Insert: {
          class_assignment_id: string
          completed_at?: string | null
          content_id: string
          id?: string
          student_id: string
          watch_percentage?: number | null
        }
        Update: {
          class_assignment_id?: string
          completed_at?: string | null
          content_id?: string
          id?: string
          student_id?: string
          watch_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "student_content_completions_class_assignment_id_fkey"
            columns: ["class_assignment_id"]
            isOneToOne: false
            referencedRelation: "course_class_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_content_completions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "course_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_content_completions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
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
      apply_sequential_unlocks: {
        Args: { p_class_module_assignment_id: string }
        Returns: undefined
      }
      get_leave_balance: {
        Args: { p_month: number; p_user_id: string; p_year: number }
        Returns: {
          balance_remaining: number
          carried_forward: number
          casual_leave_used: number
          lop_days: number
          monthly_credit: number
          sick_leave_used: number
          total_available: number
          total_used: number
        }[]
      }
      get_next_id: {
        Args: { p_entity_type: string; p_institution_id: string }
        Returns: number
      }
      get_project_institution_id: {
        Args: { _project_id: string }
        Returns: string
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
      initialize_leave_balance: {
        Args: {
          p_month: number
          p_officer_id: string
          p_user_id: string
          p_user_type: string
          p_year: number
        }
        Returns: string
      }
      is_project_member: {
        Args: { _project_id: string; _user_id: string }
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

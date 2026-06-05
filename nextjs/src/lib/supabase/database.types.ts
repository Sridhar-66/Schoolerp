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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      academic_years: {
        Row: {
          end_date: string
          id: number
          is_current: boolean | null
          name: string
          start_date: string
        }
        Insert: {
          end_date: string
          id?: number
          is_current?: boolean | null
          name: string
          start_date: string
        }
        Update: {
          end_date?: string
          id?: number
          is_current?: boolean | null
          name?: string
          start_date?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          body: string
          created_at: string | null
          created_by: string | null
          id: number
          target: string | null
          title: string
        }
        Insert: {
          body: string
          created_at?: string | null
          created_by?: string | null
          id?: number
          target?: string | null
          title: string
        }
        Update: {
          body?: string
          created_at?: string | null
          created_by?: string | null
          id?: number
          target?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_submissions: {
        Row: {
          assignment_id: number | null
          feedback: string | null
          file_url: string | null
          grade: string | null
          id: number
          student_id: number | null
          submitted_at: string | null
        }
        Insert: {
          assignment_id?: number | null
          feedback?: string | null
          file_url?: string | null
          grade?: string | null
          id?: number
          student_id?: number | null
          submitted_at?: string | null
        }
        Update: {
          assignment_id?: number | null
          feedback?: string | null
          file_url?: string | null
          grade?: string | null
          id?: number
          student_id?: number | null
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          created_at: string | null
          description: string | null
          due_date: string | null
          id: number
          section_id: number | null
          subject_id: number | null
          teacher_id: number | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: number
          section_id?: number | null
          subject_id?: number | null
          teacher_id?: number | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: number
          section_id?: number | null
          subject_id?: number | null
          teacher_id?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          date: string
          id: number
          remarks: string | null
          status: string
          student_id: number
          timetable_id: number
          updated_at: string | null
        }
        Insert: {
          date?: string
          id?: number
          remarks?: string | null
          status: string
          student_id: number
          timetable_id: number
          updated_at?: string | null
        }
        Update: {
          date?: string
          id?: number
          remarks?: string | null
          status?: string
          student_id?: number
          timetable_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_timetable_id_fkey"
            columns: ["timetable_id"]
            isOneToOne: false
            referencedRelation: "timetable"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          created_at: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      exams: {
        Row: {
          academic_year_id: number | null
          created_by: string | null
          exam_date: string | null
          id: number
          max_marks: number
          name: string
          section_id: number | null
          subject_id: number | null
        }
        Insert: {
          academic_year_id?: number | null
          created_by?: string | null
          exam_date?: string | null
          id?: number
          max_marks?: number
          name: string
          section_id?: number | null
          subject_id?: number | null
        }
        Update: {
          academic_year_id?: number | null
          created_by?: string | null
          exam_date?: string | null
          id?: number
          max_marks?: number
          name?: string
          section_id?: number | null
          subject_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exams_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_payments: {
        Row: {
          amount_paid: number
          collected_by: string | null
          fee_structure_id: number | null
          fees_structure_id: number | null
          id: number
          paid_at: string | null
          payment_method: string
          payment_status: string | null
          remarks: string | null
          roll_no: string
          status: string
          student_id: number | null
          student_name: string
          updated_at: string
        }
        Insert: {
          amount_paid: number
          collected_by?: string | null
          fee_structure_id?: number | null
          fees_structure_id?: number | null
          id?: number
          paid_at?: string | null
          payment_method?: string
          payment_status?: string | null
          remarks?: string | null
          roll_no: string
          status?: string
          student_id?: number | null
          student_name: string
          updated_at?: string
        }
        Update: {
          amount_paid?: number
          collected_by?: string | null
          fee_structure_id?: number | null
          fees_structure_id?: number | null
          id?: number
          paid_at?: string | null
          payment_method?: string
          payment_status?: string | null
          remarks?: string | null
          roll_no?: string
          status?: string
          student_id?: number | null
          student_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_payments_collected_by_fkey"
            columns: ["collected_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_payments_fee_structure_id_fkey"
            columns: ["fee_structure_id"]
            isOneToOne: false
            referencedRelation: "fees_structure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_payments_fees_structure_id_fkey"
            columns: ["fees_structure_id"]
            isOneToOne: false
            referencedRelation: "fees_structure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      fees_structure: {
        Row: {
          academic_year_id: number | null
          amount: number
          applicable_to: string | null
          due_date: string | null
          id: number
          name: string
        }
        Insert: {
          academic_year_id?: number | null
          amount: number
          applicable_to?: string | null
          due_date?: string | null
          id?: number
          name: string
        }
        Update: {
          academic_year_id?: number | null
          amount?: number
          applicable_to?: string | null
          due_date?: string | null
          id?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "fees_structure_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          created_at: string | null
          from_date: string
          id: number
          reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          student_id: number | null
          to_date: string
        }
        Insert: {
          created_at?: string | null
          from_date: string
          id?: number
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          student_id?: number | null
          to_date: string
        }
        Update: {
          created_at?: string | null
          from_date?: string
          id?: number
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          student_id?: number | null
          to_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      marks: {
        Row: {
          entered_at: string | null
          entered_by: number | null
          exam_id: number | null
          id: number
          marks_obtained: number | null
          remarks: string | null
          student_id: number | null
        }
        Insert: {
          entered_at?: string | null
          entered_by?: number | null
          exam_id?: number | null
          id?: number
          marks_obtained?: number | null
          remarks?: string | null
          student_id?: number | null
        }
        Update: {
          entered_at?: string | null
          entered_by?: number | null
          exam_id?: number | null
          id?: number
          marks_obtained?: number | null
          remarks?: string | null
          student_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "marks_entered_by_fkey"
            columns: ["entered_by"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marks_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marks_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          description: string | null
          file_url: string | null
          id: number
          section_id: number | null
          subject_id: number | null
          title: string
          uploaded_at: string | null
          uploaded_by: number | null
        }
        Insert: {
          description?: string | null
          file_url?: string | null
          id?: number
          section_id?: number | null
          subject_id?: number | null
          title: string
          uploaded_at?: string | null
          uploaded_by?: number | null
        }
        Update: {
          description?: string | null
          file_url?: string | null
          id?: number
          section_id?: number | null
          subject_id?: number | null
          title?: string
          uploaded_at?: string | null
          uploaded_by?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "materials_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materials_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      message_thread_participants: {
        Row: {
          profile_id: string
          thread_id: number
        }
        Insert: {
          profile_id: string
          thread_id: number
        }
        Update: {
          profile_id?: string
          thread_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "message_thread_participants_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_thread_participants_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      message_threads: {
        Row: {
          created_at: string | null
          id: number
          subject: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          subject?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          subject?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          id: number
          sender_id: string | null
          sent_at: string | null
          thread_id: number | null
        }
        Insert: {
          body: string
          id?: number
          sender_id?: string | null
          sent_at?: string | null
          thread_id?: number | null
        }
        Update: {
          body?: string
          id?: number
          sender_id?: string | null
          sent_at?: string | null
          thread_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string
          id: string
          phone: string | null
          role: string
        }
        Insert: {
          created_at?: string | null
          full_name: string
          id: string
          phone?: string | null
          role: string
        }
        Update: {
          created_at?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          role?: string
        }
        Relationships: []
      }
      section_teachers: {
        Row: {
          academic_year_id: number | null
          id: number
          section_id: number | null
          subject_id: number | null
          teacher_id: number | null
        }
        Insert: {
          academic_year_id?: number | null
          id?: number
          section_id?: number | null
          subject_id?: number | null
          teacher_id?: number | null
        }
        Update: {
          academic_year_id?: number | null
          id?: number
          section_id?: number | null
          subject_id?: number | null
          teacher_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "section_teachers_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "section_teachers_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "section_teachers_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      sections: {
        Row: {
          class_id: number
          created_at: string
          id: number
          name: string
        }
        Insert: {
          class_id: number
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          class_id?: number
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          academic_year_id: number | null
          address: string | null
          class_id: number | null
          dob: string | null
          id: number
          parent_name: string | null
          parent_phone: string | null
          profile_id: string | null
          roll_number: string | null
          section_id: number | null
          student_type: string
        }
        Insert: {
          academic_year_id?: number | null
          address?: string | null
          class_id?: number | null
          dob?: string | null
          id?: number
          parent_name?: string | null
          parent_phone?: string | null
          profile_id?: string | null
          roll_number?: string | null
          section_id?: number | null
          student_type?: string
        }
        Update: {
          academic_year_id?: number | null
          address?: string | null
          class_id?: number | null
          dob?: string | null
          id?: number
          parent_name?: string | null
          parent_phone?: string | null
          profile_id?: string | null
          roll_number?: string | null
          section_id?: number | null
          student_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          applicable_groups: string[] | null
          code: string
          id: number
          name: string
        }
        Insert: {
          applicable_groups?: string[] | null
          code: string
          id?: number
          name: string
        }
        Update: {
          applicable_groups?: string[] | null
          code?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      teacher_subjects: {
        Row: {
          id: number
          subject_id: number | null
          teacher_id: number | null
        }
        Insert: {
          id?: number
          subject_id?: number | null
          teacher_id?: number | null
        }
        Update: {
          id?: number
          subject_id?: number | null
          teacher_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "teacher_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_subjects_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_substitutions: {
        Row: {
          created_at: string | null
          date: string
          id: number
          reason: string | null
          substitute_teacher_id: number | null
          timetable_id: number | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: number
          reason?: string | null
          substitute_teacher_id?: number | null
          timetable_id?: number | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: number
          reason?: string | null
          substitute_teacher_id?: number | null
          timetable_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "teacher_substitutions_substitute_teacher_id_fkey"
            columns: ["substitute_teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          employee_id: string | null
          id: number
          joined_date: string | null
          profile_id: string | null
          teacher_type: string
        }
        Insert: {
          employee_id?: string | null
          id?: number
          joined_date?: string | null
          profile_id?: string | null
          teacher_type?: string
        }
        Update: {
          employee_id?: string | null
          id?: number
          joined_date?: string | null
          profile_id?: string | null
          teacher_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "teachers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      timetable: {
        Row: {
          class_id: number
          created_at: string | null
          day_of_week: string
          end_time: string
          id: number
          start_time: string
          subject_name: string
        }
        Insert: {
          class_id: number
          created_at?: string | null
          day_of_week: string
          end_time: string
          id?: number
          start_time: string
          subject_name: string
        }
        Update: {
          class_id?: number
          created_at?: string | null
          day_of_week?: string
          end_time?: string
          id?: number
          start_time?: string
          subject_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "timetable_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
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

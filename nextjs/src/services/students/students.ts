"use server";

import { createServerAdminClient } from "@/lib/supabase/serverAdminClient";

export interface StudentRecord {
  id: number;
  roll_number: string | null;
  student_type: string | null;
  parent_name: string | null;
  profiles: {
    id: string;
    full_name: string | null;
  } | null;
  sections?: {
    name: string;
    classes: {
      name: string;
    } | null;
  } | null;
  academic_years?: {
    name: string;
  } | null;
}

// Fetch comprehensive student directory with multi-level relational joins
export async function getStudents(): Promise<StudentRecord[]> {
  const supabase = createServerAdminClient();
  
  const { data, error } = await (supabase as any)
    .from("students")
    .select(`
      id,
      roll_number,
      student_type,
      parent_name,
      profiles!profile_id (
        id,
        full_name
      ),
      sections!section_id (
        name,
        classes ( name )
      ),
      academic_years!academic_year_id (
        name
      )
    `);

  if (error) throw new Error(`Failed to fetch student directory: ${error.message}`);
  return data || [];
}
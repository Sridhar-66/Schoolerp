"use server";

import { createServerAdminClient } from "@/lib/supabase/serverAdminClient";

export interface TeacherRecord {
  id: number;
  teacher_type: string | null;
  employee_id: string | null;
  joined_date: string | null;
  profiles: {
    id: string;
    full_name: string | null;
  } | null;
}

export async function getTeachers(): Promise<TeacherRecord[]> {
  const supabase = createServerAdminClient();
  
  const { data, error } = await (supabase as any)
    .from("teachers")
    .select(`
      id,
      teacher_type,
      employee_id,
      joined_date,
      profiles!profile_id (
        id,
        full_name
      )
    `);

  if (error) throw new Error(`Failed to read teachers registry: ${error.message}`);
  return data || [];
}


export async function getTeacherById(id: string | number): Promise<any> {
  const supabase = createServerAdminClient();
  
  const { data, error } = await (supabase as any)
    .from("teachers")
    .select(`
      id,
      teacher_type,
      joined_date,
      employee_id,
      profiles!profile_id (
        id,
        full_name
      )
    `)
    .eq("id", id)
    .single();

  if (error) throw new Error(`Failed to fetch teacher profile: ${error.message}`);
  return data;
}
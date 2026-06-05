"use server";

import { createServerAdminClient } from "@/lib/supabase/serverAdminClient";

export interface TeacherRecord {
  id: number;
  teacher_type: string | null;
  joined_date: string | null;
  employee_id: string | null;
  profiles: {
    id: string;
    full_name: string | null;
  } | null;
}

export interface AddTeacherInput {
  full_name: string;
  email: string;
  password: string;
  phone?: string | null;
}

export async function getTeachers(): Promise<TeacherRecord[]> {
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
    `);

  if (error) throw new Error(`Failed to read teachers directory: ${error.message}`);
  return data || [];
}

export async function addTeacher(input: AddTeacherInput): Promise<void> {
  const supabase = createServerAdminClient();

  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: input.full_name },
  });

  if (authError) throw new Error(`Failed to create auth account: ${authError.message}`);

  const userId = authData.user.id;

  // 2. Upsert into profiles
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      full_name: input.full_name,
      role: "teacher",
      ...(input.phone ? { phone: input.phone } : {}),
    });

  if (profileError) throw new Error(`Failed to create profile: ${profileError.message}`);

  // 3. Insert into teachers
  const { error: teacherError } = await (supabase as any)
    .from("teachers")
    .insert({ profile_id: userId });

  if (teacherError) throw new Error(`Failed to create teacher record: ${teacherError.message}`);
}
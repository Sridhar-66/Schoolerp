"use server";

import { createServerAdminClient } from "@/lib/supabase/serverAdminClient";

type UpdateStudentInput = {
  id: number;
  full_name: string;
  phone: string | null;
  roll_number: string | null;
  student_type: string;
  class_id: number | null;
  section_id: number | null;
};

export async function updateStudent(input: UpdateStudentInput) {
  // Asserting as 'any' bypasses strict ungenerated database schema type constraints
  const supabase = createServerAdminClient() as any;

  // 1. Update fields inside the core students data table and extract profile reference id
  const { data: studentData, error: studentError } = await supabase
    .from("students")
    .update({
      class_id: input.class_id,
      section_id: input.section_id,
      roll_number: input.roll_number,
      student_type: input.student_type,
    })
    .eq("id", input.id)
    .select("profile_id")
    .single();

  if (studentError) throw new Error(`Student Update Error: ${studentError.message}`);

  // 2. Synchronize up-to-date relational details inside the linked profiles row
  if (studentData?.profile_id) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: input.full_name,
        phone: input.phone,
      })
      .eq("id", studentData.profile_id);

    if (profileError) throw new Error(`Profile Update Error: ${profileError.message}`);
  }

  return { success: true };
}

export async function deleteStudent(studentId: number) {
  const supabase = createServerAdminClient() as any;

  // 1. Resolve and store the unique user profile identification uuid before dropping references
  const { data: studentData, error: fetchError } = await supabase
    .from("students")
    .select("profile_id")
    .eq("id", studentId)
    .single();

  if (fetchError) throw new Error(`Fetch Relation Error: ${fetchError.message}`);

  // 2. Sever relational database links by dropping the student metrics matrix row
  const { error: studentError } = await supabase
    .from("students")
    .delete()
    .eq("id", studentId);

  if (studentError) throw new Error(`Student Deletion Error: ${studentError.message}`);

  // 3. Leverage bypass admin context to drop the authentication and corresponding cascades completely
  if (studentData?.profile_id) {
    const { error: authError } = await supabase.auth.admin.deleteUser(studentData.profile_id);
    
    if (authError) throw new Error(`Auth Account Purge Error: ${authError.message}`);
  }

  return { success: true };
}
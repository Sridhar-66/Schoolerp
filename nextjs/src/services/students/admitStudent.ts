"use server";

import { createServerAdminClient } from "@/lib/supabase/serverAdminClient";

export interface AdmitStudentPayload {
  full_name: string;
  email: string;
  password?: string;
  phone: string | null;
  dob: string | null;
  address: string | null;
  roll_number: string | null;
  student_type: string;
  section_id: number | null;
  academic_year_id: number | null;
  parent_name: string | null;
  parent_phone: string | null;
}

export async function admitStudent(payload: AdmitStudentPayload) {
  const supabase = createServerAdminClient();

  // STEP 1: Create auth user first — this generates the UUID
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email: payload.email,
    password: payload.password,
    email_confirm: true,
    user_metadata: { full_name: payload.full_name },
  });

  if (authErr || !authData?.user) {
    throw new Error(`Auth user creation failed: ${authErr?.message}`);
  }

  const userId = authData.user.id; // ← this is the UUID profiles.id needs

  // STEP 2: Insert into profiles using that UUID as the id
  // STEP 2: Upsert profile (handles trigger pre-creating it)
const { error: profileErr } = await (supabase as any)
  .from("profiles")
  .upsert([{
    id: userId,
    full_name: payload.full_name,
    role: "student",
    phone: payload.phone,
  }], { onConflict: "id" });  // ← if it already exists, just update it
  
  if (profileErr) {
    // Rollback: delete the auth user we just created
    await supabase.auth.admin.deleteUser(userId);
    throw new Error(`Profile initialization failed: ${profileErr.message}`);
  }

  // STEP 3: Insert into students table
  const { data: studentRecord, error: studentErr } = await (supabase as any)
    .from("students")
    .insert([{
      profile_id: userId,
      roll_number: payload.roll_number || null,
      student_type: payload.student_type,
      parent_name: payload.parent_name || null,
      parent_phone: payload.parent_phone || null,
      section_id: payload.section_id,
      academic_year_id: payload.academic_year_id,
    }])
    .select()
    .single();

  if (studentErr) {
    // Rollback both auth user and profile
    await (supabase as any).from("profiles").delete().eq("id", userId);
    await supabase.auth.admin.deleteUser(userId);
    throw new Error(`Student record creation failed: ${studentErr.message}`);
  }

  return studentRecord;
}
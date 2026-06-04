"use server";

import { createServerAdminClient } from "@/lib/supabase/serverAdminClient";

type AdmitStudentInput = {
  full_name: string;
  email: string;
  password: string;
  phone: string | null;
  dob: string | null;
  address: string | null;
  roll_number: string | null;
  student_type: string;
  section_id: number | null;
  academic_year_id: number | null;
  parent_name: string | null;
  parent_phone: string | null;
};

export async function admitStudent(input: AdmitStudentInput) {
  const supabase = createServerAdminClient();

  console.log("📝 Step 1: Creating Auth User...");

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
  });

  if (authError) throw new Error(`Auth Error: ${authError.message}`);

  const userId = authData.user.id;
  console.log("✅ Auth User created:", userId);

  console.log("📝 Step 2: Updating Profile...");

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: input.full_name,
      phone: input.phone,
      role: "student",
    })
    .eq("id", userId);

  if (profileError) throw new Error(`Profile Error: ${profileError.message}`);

  console.log("📝 Step 3: Creating Student record...");

  const { error: studentError } = await supabase
    .from("students")
    .insert({
      profile_id: userId,
      section_id: input.section_id,
      academic_year_id: input.academic_year_id,
      roll_number: input.roll_number,
      dob: input.dob,
      address: input.address,
      parent_name: input.parent_name,
      parent_phone: input.parent_phone,
      student_type: input.student_type,
    });

  if (studentError) throw new Error(`Student Error: ${studentError.message}`);

  console.log("✅ Student fully admitted!");
  return { success: true };
}
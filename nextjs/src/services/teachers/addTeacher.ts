"use server";

import { createServerAdminClient } from "@/lib/supabase/serverAdminClient";

type AddTeacherInput = {
  full_name: string;
  email: string;
  password: string;
  phone: string | null;
};

export async function addTeacher(input: AddTeacherInput) {
  const supabase = createServerAdminClient();

  console.log("📝 Step 1: Creating Auth User for Teacher...");

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
  });

  if (authError) throw new Error(`Auth Error: ${authError.message}`);

  const userId = authData.user.id;
  console.log("✅ Auth User created:", userId);

  console.log("📝 Step 2: Updating Profile Metadata...");

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: input.full_name,
      phone: input.phone,
      role: "teacher",
    })
    .eq("id", userId);

  if (profileError) throw new Error(`Profile Error: ${profileError.message}`);

  console.log("📝 Step 3: Creating Relational Teacher Record...");

  const { error: teacherError } = await supabase
    .from("teachers")
    .insert({
      profile_id: userId,
    });

  if (teacherError) throw new Error(`Teacher Error: ${teacherError.message}`);

  console.log("✅ Teacher fully registered and onboarded!");
  return { success: true };
}
"use server";

import { createServerAdminClient } from "@/lib/supabase/serverAdminClient";

export async function admitStudent() {
  const supabase = createServerAdminClient();

  console.log("📝 Step 1: Creating a real Auth User...");
  
  const testEmail = `student_${Date.now()}@testschool.com`;
  
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: "Password123!",
    email_confirm: true,
  });

  if (authError) {
    console.error("❌ Auth Creation Error:", authError);
    throw new Error(`Auth Error: ${authError.message}`);
  }

  const realUserId = authData.user.id;
  console.log("✅ Auth User created with ID:", realUserId);

  console.log("📝 Step 2: Updating the auto-generated Profile...");

  // 2. UPDATE instead of insert! The DB trigger already created the row.
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: "Test Student",
      role: "student",
    })
    .eq("id", realUserId) // Target the row the trigger just created
    .select();

  if (profileError) {
    console.error("❌ Profile Update Error:", profileError);
    throw new Error(`Profile Error: ${profileError.message}`);
  }

  console.log("✅ Success! Student fully admitted:", profileData);

  return { 
    success: true, 
    data: profileData 
  };
}
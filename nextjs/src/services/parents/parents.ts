"use server";

import { createServerAdminClient } from "@/lib/supabase/serverAdminClient";

export interface ParentRecord {
  id: number;
  parent_name: string | null;
  parent_phone: string | null;
  profiles: {
    full_name: string | null;
  } | null;
}

// 1. Fetch all parents linked to their child's profile name
export async function getParents(): Promise<ParentRecord[]> {
  const supabase = createServerAdminClient();
  
  const { data, error } = await (supabase as any)
    .from("students")
    .select(`
      id,
      parent_name,
      parent_phone,
      profiles!profile_id (
        full_name
      )
    `);

  if (error) throw new Error(`Failed to fetch parents directory: ${error.message}`);
  return data || [];
}

// 2. Fetch a single parent record for editing
export async function getParentByStudentId(studentId: string | number): Promise<ParentRecord> {
  const supabase = createServerAdminClient();

  const { data, error } = await (supabase as any)
    .from("students")
    .select(`
      id,
      parent_name,
      parent_phone,
      profiles!profile_id (
        full_name
      )
    `)
    .eq("id", Number(studentId)) // 👈 FIXED: Force conversion to a number block
    .single();

  if (error) throw new Error(`Failed to find parent record: ${error.message}`);
  return data;
}

// 3. Update parent information inside the student table row
export async function updateParentInfo(
  studentId: string | number,
  payload: { parent_name: string | null; parent_phone: string | null }
) {
  const supabase = createServerAdminClient();

  const { error } = await supabase
    .from("students")
    .update({
      parent_name: payload.parent_name,
      parent_phone: payload.parent_phone,
    })
    .eq("id", Number(studentId)); // 👈 FIXED: Force conversion to a number block

  if (error) throw new Error(`Failed to update parent records: ${error.message}`);
  return { success: true };
}
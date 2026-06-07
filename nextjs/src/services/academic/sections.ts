"use server";
import { createServerAdminClient } from "@/lib/supabase/serverAdminClient";

export interface SectionWithClass {
  id: number;
  name: string;
  class_id: number;
  created_at: string | null;
  classes: {
    name: string;
  } | null;
}

export async function getSections(): Promise<SectionWithClass[]> {
  const supabase = createServerAdminClient();

  const { data, error } = await (supabase as any)
    .from("sections")
    .select("id, name, class_id, created_at, classes(name)")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to retrieve school sections: ${error.message}`);
  }

  return data || [];
}

export async function addSection(name: string, classId: number) {
  const supabase = createServerAdminClient();

  const { data, error } = await (supabase as any)
    .from("sections")
    .insert({ name, class_id: classId })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to provision new section: ${error.message}`);
  }

  return data;
}
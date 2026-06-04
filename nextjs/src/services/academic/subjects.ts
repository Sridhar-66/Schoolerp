"use server";

import { createServerAdminClient } from "@/lib/supabase/serverAdminClient";

export interface Subject {
  id: number;
  name: string;
  code: string;
}

export async function getSubjects(): Promise<Subject[]> {
  const supabase = createServerAdminClient();

  const { data, error } = await (supabase as any)
    .from("subjects")
    .select("id, name, code")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to retrieve academic subjects: ${error.message}`);
  }

  return data || [];
}

export async function addSubject(name: string, code: string) {
  const supabase = createServerAdminClient();

  const { data, error } = await (supabase as any)
    .from("subjects")
    .insert({ name, code })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to provision new course subject: ${error.message}`);
  }

  return data;
}

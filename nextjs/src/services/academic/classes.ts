"use server";

import { createServerAdminClient } from "@/lib/supabase/serverAdminClient";

export interface ClassWithCount {
  id: number;
  name: string;
  section_count: number;
}

export async function getClasses(): Promise<ClassWithCount[]> {
  const supabase = createServerAdminClient();

  // Casting the client to any completely silences the outdated schema cache errors
  const { data, error } = await (supabase as any)
    .from("classes")
    .select("id, name, sections(id)")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to retrieve school classes: ${error.message}`);
  }

  return (data || []).map((cls: any) => ({
    id: cls.id,
    name: cls.name,
    section_count: Array.isArray(cls.sections) ? cls.sections.length : 0,
  }));
}

export async function addClass(name: string) {
  const supabase = createServerAdminClient();

  const { data, error } = await (supabase as any)
    .from("classes")
    .insert({ name })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to provision new class tier: ${error.message}`);
  }

  return data;
}

export async function getClassDetails(classId: number) {
  const supabase = createServerAdminClient();

  const { data: classData, error: classError } = await (supabase as any)
    .from("classes")
    .select("name")
    .eq("id", classId)
    .single();

  if (classError) {
    throw new Error(`Class record not found: ${classError.message}`);
  }

  const { data: sectionsData, error: sectionsError } = await (supabase as any)
    .from("sections")
    .select("id, name")
    .eq("class_id", classId)
    .order("name", { ascending: true });

  if (sectionsError) {
    throw new Error(`Failed to fetch linked section indexes: ${sectionsError.message}`);
  }

  const sections = (sectionsData || []).map((sec: any) => ({
    id: sec.id,
    name: sec.name,
    student_count: 0,
  }));

  return {
    name: (classData as any).name,
    sections,
  };
}

export async function addSection(classId: number, name: string) {
  const supabase = createServerAdminClient();

  const { data, error } = await (supabase as any)
    .from("sections")
    .insert({ class_id: classId, name })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to provision new section: ${error.message}`);
  }

  return data;
}
"use server";

import { createServerAdminClient } from "@/lib/supabase/serverAdminClient";

export interface ExamRecord {
  id: number;
  name: string;
  subject_id: number | null;
  section_id: number | null;
  academic_year_id: number | null;
  exam_date: string | null;
  max_marks: number;
  subjects?: { name: string } | null;
  sections?: { 
    name: string; 
    classes: { name: string } | null; 
  } | null;
  academic_years?: { name: string } | null;
}

// 1. Fetch all exams with explicit relational metadata hints
export async function getExams(): Promise<ExamRecord[]> {
  const supabase = createServerAdminClient();

  const { data, error } = await (supabase as any)
    .from("exams")
    .select(`
      id,
      name,
      exam_date,
      max_marks,
      subject_id,
      section_id,
      academic_year_id,
      subjects!subject_id ( name ),
      sections!section_id (
        name,
        classes ( name )
      ),
      academic_years!academic_year_id ( name )
    `)
    .order("exam_date", { ascending: false });

  if (error) throw new Error(`Failed to load institutional examinations: ${error.message}`);
  return data || [];
}

// 2. Fetch comprehensive lookup indexes required to populate the scheduling forms
export async function getExamFormLookups() {
  const supabase = createServerAdminClient();

  const [subjectsRes, sectionsRes, yearsRes] = await Promise.all([
    supabase.from("subjects").select("id, name").order("name", { ascending: true }),
    (supabase as any).from("sections").select("id, name, classes ( name )"),
    supabase.from("academic_years").select("id, name").order("id", { ascending: false })
  ]);

  if (subjectsRes.error) throw new Error(`Subjects lookup failed: ${subjectsRes.error.message}`);
  if (sectionsRes.error) throw new Error(`Sections lookup failed: ${sectionsRes.error.message}`);
  if (yearsRes.error) throw new Error(`Academic years lookup failed: ${yearsRes.error.message}`);

  return {
    subjects: subjectsRes.data || [],
    sections: (sectionsRes.data || []).map((sec: any) => ({
      id: sec.id,
      display_name: `${sec.classes?.name || "Uncategorized Class"} — ${sec.name}`
    })),
    academicYears: yearsRes.data || []
  };
}

// 3. Create/Schedule a new examination entry
export async function createExam(payload: {
  name: string;
  subject_id: number;
  section_id: number;
  academic_year_id: number;
  exam_date: string;
  max_marks: number;
}) {
  const supabase = createServerAdminClient();

  const { data, error } = await (supabase as any)
    .from("exams")
    .insert([payload])
    .select()
    .single();

  if (error) throw new Error(`Failed to commit new examination row: ${error.message}`);
  return data;
}
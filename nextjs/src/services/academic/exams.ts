"use server";

import { createServerAdminClient } from "@/lib/supabase/serverAdminClient";

export interface ExamRow {
  id: number;
  name: string;
  exam_date: string | null;
  subject_id: number | null;
  subject_name: string | null;
  section_id: number | null;
  section_display_name: string | null;
  academic_year_id: number | null;
  academic_year_name: string | null;
  max_marks: number;
}

export interface SubjectOption {
  id: number;
  name: string;
  code: string;
}

export interface SectionOption {
  id: number;
  name: string;
  class_id: number;
  class_name: string;
}

export interface AcademicYearOption {
  id: number;
  name: string;
  is_current: boolean | null;
}

export interface CreateExamPayload {
  name: string;
  exam_date: string | null;
  subject_id: number | null;
  section_id: number | null;
  academic_year_id: number | null;
  max_marks: number;
}

export interface UpdateExamPayload extends CreateExamPayload {
  id: number;
}

// ── Fetch all exams with joins ────────────────────────────────────────────────

export async function getExams(): Promise<ExamRow[]> {
  const supabase = createServerAdminClient();

  const { data, error } = await supabase
    .from("exams")
    .select(
      "id, name, exam_date, max_marks, subject_id, subjects(name), section_id, sections(name, class_id, classes(name)), academic_year_id, academic_years(name)"
    )
    .order("exam_date", { ascending: true });

  if (error) throw new Error(`Failed to load exams: ${error.message}`);

  return (data || []).map((e: any) => ({
    id: e.id,
    name: e.name,
    exam_date: e.exam_date ?? null,
    subject_id: e.subject_id ?? null,
    subject_name: e.subjects?.name ?? null,
    section_id: e.section_id ?? null,
    section_display_name: e.sections
      ? `${e.sections.classes?.name ?? "Class"} - ${e.sections.name}`
      : null,
    academic_year_id: e.academic_year_id ?? null,
    academic_year_name: e.academic_years?.name ?? null,
    max_marks: e.max_marks,
  }));
}

// ── Fetch dropdown options ────────────────────────────────────────────────────

export async function getExamFormOptions(): Promise<{
  subjects: SubjectOption[];
  sections: SectionOption[];
  academicYears: AcademicYearOption[];
}> {
  const supabase = createServerAdminClient();

  const [subjectsRes, sectionsRes, yearsRes] = await Promise.all([
    supabase.from("subjects").select("id, name, code").order("name"),
    supabase
      .from("sections")
      .select("id, name, class_id, classes(name)")
      .order("class_id"),
    supabase
      .from("academic_years")
      .select("id, name, is_current")
      .order("start_date", { ascending: false }),
  ]);

  if (subjectsRes.error)
    throw new Error(`Failed to load subjects: ${subjectsRes.error.message}`);
  if (sectionsRes.error)
    throw new Error(`Failed to load sections: ${sectionsRes.error.message}`);
  if (yearsRes.error)
    throw new Error(
      `Failed to load academic years: ${yearsRes.error.message}`
    );

  return {
    subjects: subjectsRes.data || [],
    sections: (sectionsRes.data || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      class_id: s.class_id,
      class_name: s.classes?.name ?? `Class ${s.class_id}`,
    })),
    academicYears: yearsRes.data || [],
  };
}

// ── Create ────────────────────────────────────────────────────────────────────

export async function createExam(payload: CreateExamPayload): Promise<void> {
  const supabase = createServerAdminClient();

  const { error } = await supabase.from("exams").insert({
    name: payload.name,
    exam_date: payload.exam_date,
    subject_id: payload.subject_id,
    section_id: payload.section_id,
    academic_year_id: payload.academic_year_id,
    max_marks: payload.max_marks,
  });

  if (error) throw new Error(`Failed to create exam: ${error.message}`);
}

// ── Update ────────────────────────────────────────────────────────────────────

export async function updateExam(payload: UpdateExamPayload): Promise<void> {
  const supabase = createServerAdminClient();

  const { error } = await supabase
    .from("exams")
    .update({
      name: payload.name,
      exam_date: payload.exam_date,
      subject_id: payload.subject_id,
      section_id: payload.section_id,
      academic_year_id: payload.academic_year_id,
      max_marks: payload.max_marks,
    })
    .eq("id", payload.id);

  if (error) throw new Error(`Failed to update exam: ${error.message}`);
}

// ── Delete ────────────────────────────────────────────────────────────────────

export async function deleteExam(id: number): Promise<void> {
  const supabase = createServerAdminClient();

  const { error } = await supabase.from("exams").delete().eq("id", id);

  if (error) throw new Error(`Failed to delete exam: ${error.message}`);
}
"use server";

import { createServerAdminClient } from "@/lib/supabase/serverAdminClient";
import { computeGrade, type StudentResultRow, type StudentResultDetail } from "@/services/academic/results-helpers";

function toResultRow(e: any): StudentResultRow {
  const pct = e.marks_obtained !== null && e.max_marks
    ? Math.round((e.marks_obtained / e.max_marks) * 100)
    : null;
  return {
    exam_id: e.exam_id,
    exam_name: e.exams?.name ?? "--",
    exam_date: e.exams?.exam_date ?? null,
    max_marks: e.exams?.max_marks ?? 100,
    marks_obtained: e.marks_obtained ?? null,
    remarks: e.remarks ?? null,
    subject_id: e.exams?.subject_id ?? null,
    subject_name: e.exams?.subjects?.name ?? null,
    subject_code: e.exams?.subjects?.code ?? null,
    section_id: e.exams?.section_id ?? null,
    section_display_name: e.exams?.sections
      ? `${e.exams.sections.classes?.name ?? "Class"} - ${e.exams.sections.name ?? ""}`
      : null,
    academic_year_id: e.exams?.academic_year_id ?? null,
    academic_year_name: e.exams?.academic_years?.name ?? null,
    percentage: pct,
    grade: computeGrade(pct),
  };
}

export async function getStudentResults(studentId: number): Promise<StudentResultRow[]> {
  const supabase = createServerAdminClient();
  const { data, error } = await supabase
    .from("marks")
    .select(`exam_id, marks_obtained, remarks, exams ( name, exam_date, max_marks, subject_id, subjects ( name, code ), section_id, sections ( name, class_id, classes ( name ) ), academic_year_id, academic_years ( name ) )`)
    .eq("student_id", studentId)
    .order("exam_id", { ascending: false });
  if (error) throw new Error(`Failed to load results: ${error.message}`);
  return (data || []).map(toResultRow);
}

export async function getStudentResultByExam(studentId: number, examId: number): Promise<StudentResultDetail | null> {
  const supabase = createServerAdminClient();
  const [marksRes, reportCardRes] = await Promise.all([
    supabase
      .from("marks")
      .select(`exam_id, marks_obtained, remarks, entered_at, exams ( name, exam_date, max_marks, subject_id, subjects ( name, code ), section_id, sections ( name, class_id, classes ( name ) ), academic_year_id, academic_years ( name ) )`)
      .eq("student_id", studentId)
      .eq("exam_id", examId)
      .single(),
    supabase
      .from("report_cards")
      .select("admin_remarks, is_published")
      .eq("student_id", studentId)
      .maybeSingle(),
  ]);
  if (marksRes.error) return null;
  const row = toResultRow(marksRes.data as any);
  return {
    ...row,
    entered_at: (marksRes.data as any).entered_at ?? null,
    admin_remarks: (reportCardRes.data as any)?.admin_remarks ?? null,
    is_published: (reportCardRes.data as any)?.is_published ?? false,
  };
}
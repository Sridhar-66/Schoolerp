"use server";

import { createServerAdminClient } from "@/lib/supabase/serverAdminClient";

export interface StudentMarksRow {
  student_id: number;
  student_name: string;
  roll_no: string;
  marks_obtained: number | string;
  remarks: string;
  existing_mark_id?: number;
}

export async function getMarksEntryManifest(examId: number) {
  const supabase = createServerAdminClient();

  // 1. Fetch individual exam specifications
  const { data: exam, error: examErr } = await (supabase as any)
    .from("exams")
    .select("id, name, max_marks, section_id, subjects(name)")
    .eq("id", examId)
    .single();

  if (examErr || !exam) throw new Error("Target assessment metadata context unavailable.");

  // 2. Fetch all student profiles bound to this exam's operational section
  const { data: students, error: studentErr } = await (supabase as any)
    .from("profiles")
    .select("id, full_name, roll_no")
    .eq("section_id", exam.section_id)
    .order("full_name", { ascending: true });

  if (studentErr) throw new Error(`Failed to load section student index: ${studentErr.message}`);

  // 3. Fetch any historical marks already logged for this exam
  const { data: recordedMarks, error: marksErr } = await supabase
    .from("marks")
    .select("id, student_id, marks_obtained, remarks")
    .eq("exam_id", examId);

  if (marksErr) throw new Error(`Failed to query existing score values: ${marksErr.message}`);

  // 4. Merge records cleanly to build a functional spreadsheet grid payload
  const manifest: StudentMarksRow[] = (students || []).map((student: any) => {
    const scoreRecord = (recordedMarks || []).find((m) => m.student_id === student.id);
    return {
      student_id: student.id,
      student_name: student.full_name,
      roll_no: student.roll_no || `REG-${student.id.toString().padStart(4, "0")}`,
      marks_obtained: scoreRecord ? scoreRecord.marks_obtained : "",
      remarks: scoreRecord?.remarks || "",
      existing_mark_id: scoreRecord?.id,
    };
  });

  return {
    examInfo: {
      id: exam.id,
      name: exam.name,
      max_marks: exam.max_marks,
      subject_name: exam.subjects?.name || "General Study",
    },
    manifest,
  };
}

export async function saveMarksManifest(examId: number, rows: StudentMarksRow[]) {
  const supabase = createServerAdminClient();

  // Construct upsert payloads safely formatted to match your strict marks schema
  const payloads = rows.map((row) => ({
    ...(row.existing_mark_id ? { id: row.existing_mark_id } : {}),
    exam_id: examId,
    student_id: row.student_id,
    marks_obtained: row.marks_obtained === "" ? null : Number(row.marks_obtained),
    remarks: row.remarks || null,
  }));

  const { error } = await supabase
    .from("marks")
    .upsert(payloads, { onConflict: "id" });

  if (error) throw new Error(`Database rejected score manifest transaction: ${error.message}`);
  return true;
}
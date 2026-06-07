"use server";

import { createServerAdminClient } from "@/lib/supabase/serverAdminClient";

export interface SectionOption {
  id: number;
  name: string;
  class_id: number;
  class_name: string;
}

export interface TimetableSlot {
  id: number;
  period_number: number;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  subject_id: number | null;
  subject_name: string | null;
}

export interface StudentAttendanceRow {
  student_id: number;
  roll_number: string | null;
  full_name: string;
  attendance_id: number | null;
  status: "present" | "absent" | null;
}

export interface SaveAttendancePayload {
  section_id: number;
  timetable_id: number;
  date: string;
  records: { student_id: number; status: "present" | "absent" }[];
}

// ── Sections ──────────────────────────────────────────────────────────────────

export async function getSections(): Promise<SectionOption[]> {
  const supabase = createServerAdminClient();

  const { data, error } = await (supabase as any)
    .from("sections")
    .select("id, name, class_id, classes(name)")
    .order("class_id", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error(`Failed to load sections: ${error.message}`);

  return (data || []).map((s: any) => ({
    id: s.id,
    name: s.name,
    class_id: s.class_id,
    class_name: s.classes?.name ?? `Class ${s.class_id}`,
  }));
}

// ── Timetable slots for a section + date ─────────────────────────────────────

export async function getTimetableSlots(
  section_id: number,
  date: string
): Promise<TimetableSlot[]> {
  const supabase = createServerAdminClient();

  const { data, error } = await (supabase as any)
    .from("timetable")
    .select("id, period_number, date, start_time, end_time, subject_id, subjects(name)")
    .eq("section_id", section_id)
    .eq("date", date)
    .order("period_number", { ascending: true });

  if (error) throw new Error(`Failed to load timetable: ${error.message}`);

  return (data || []).map((t: any) => ({
    id: t.id,
    period_number: t.period_number,
    date: t.date ?? null,
    start_time: t.start_time ?? null,
    end_time: t.end_time ?? null,
    subject_id: t.subject_id ?? null,
    subject_name: t.subjects?.name ?? null,
  }));
}

// ── Students + existing attendance ────────────────────────────────────────────

export async function getStudentsWithAttendance(
  section_id: number,
  timetable_id: number,
  date: string
): Promise<StudentAttendanceRow[]> {
  const supabase = createServerAdminClient();

  const { data: students, error: studentsError } = await (supabase as any)
    .from("students")
    .select("id, roll_number, profiles(full_name)")
    .eq("section_id", section_id)
    .order("roll_number", { ascending: true });

  if (studentsError)
    throw new Error(`Failed to load students: ${studentsError.message}`);

  if (!students || students.length === 0) return [];

  const studentIds = (students as any[]).map((s: any) => s.id);

  const { data: attendanceRecords, error: attError } = await (supabase as any)
    .from("attendance")
    .select("id, student_id, status")
    .in("student_id", studentIds)
    .eq("timetable_id", timetable_id)
    .eq("date", date);

  if (attError)
    throw new Error(`Failed to load attendance: ${attError.message}`);

  const attendanceMap = new Map<number, { id: number; status: string }>();
  for (const rec of attendanceRecords || []) {
    attendanceMap.set(rec.student_id, { id: rec.id, status: rec.status });
  }

  return (students as any[]).map((s: any) => {
    const existing = attendanceMap.get(s.id) ?? null;
    return {
      student_id: s.id,
      roll_number: s.roll_number ?? null,
      full_name: s.profiles?.full_name ?? "Unknown",
      attendance_id: existing?.id ?? null,
      status: (existing?.status as "present" | "absent") ?? null,
    };
  });
}

// ── Save (upsert) attendance ──────────────────────────────────────────────────

export async function saveAttendance(
  payload: SaveAttendancePayload
): Promise<void> {
  const supabase = createServerAdminClient();
  const { timetable_id, date, records } = payload;

  if (records.length === 0) return;

  const rows = records.map((r) => ({
    student_id: r.student_id,
    timetable_id,
    date,
    status: r.status,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await (supabase as any)
    .from("attendance")
    .upsert(rows, { onConflict: "student_id,timetable_id,date" });

  if (error) throw new Error(`Failed to save attendance: ${error.message}`);
}
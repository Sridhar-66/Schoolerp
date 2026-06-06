"use server";

import { createServerAdminClient } from "@/lib/supabase/serverAdminClient";

export interface SectionOption {
  id: number;
  name: string;
  class_id: number;
  class_name: string;
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
  date: string; // ISO date string e.g. "2025-06-01"
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

// ── Students + existing attendance for a given section + date ─────────────────

export async function getStudentsWithAttendance(
  section_id: number,
  date: string
): Promise<StudentAttendanceRow[]> {
  const supabase = createServerAdminClient();

  // Fetch students in section, joining profile for name
  const { data: students, error: studentsError } = await (supabase as any)
    .from("students")
    .select("id, roll_number, profiles(full_name)")
    .eq("section_id", section_id)
    .order("roll_number", { ascending: true });

  if (studentsError)
    throw new Error(`Failed to load students: ${studentsError.message}`);

  if (!students || students.length === 0) return [];

  const studentIds = (students as any[]).map((s: any) => s.id);

  // Fetch existing attendance records for this section + date
  const { data: attendanceRecords, error: attError } = await (supabase as any)
    .from("attendance")
    .select("id, student_id, status")
    .in("student_id", studentIds)
    .eq("date", date);

  if (attError)
    throw new Error(`Failed to load attendance: ${attError.message}`);

  const attendanceMap = new Map<
    number,
    { id: number; status: string }
  >();
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

// ── Save (upsert) attendance ───────────────────────────────────────────────────

export async function saveAttendance(
  payload: SaveAttendancePayload
): Promise<void> {
  const supabase = createServerAdminClient();
  const { section_id, date, records } = payload;

  if (records.length === 0) return;

  // Build upsert rows — use student_id + date as natural conflict key
  const rows = records.map((r) => ({
    student_id: r.student_id,
    date,
    status: r.status,
    updated_at: new Date().toISOString(),
  }));

  // Upsert on (student_id, date) — requires a unique constraint on those columns
  const { error } = await (supabase as any)
    .from("attendance")
    .upsert(rows, { onConflict: "student_id,date" });

  if (error) throw new Error(`Failed to save attendance: ${error.message}`);
}
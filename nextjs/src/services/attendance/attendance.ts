"use server";

import { createServerAdminClient } from "../../lib/supabase/serverAdminClient";

export interface ClassItem {
  id: number;
  name: string;
}

export interface TimetableSlot {
  id: number;
  subject_name: string;
  start_time: string;
  end_time: string;
}

export interface RosterStudent {
  student_id: number;
  roll_no: number;
  name: string;
  status: string;
}

export async function getClasses(): Promise<ClassItem[]> {
  const supabase = createServerAdminClient();

  const { data, error } = await (supabase as any)
    .from("classes")
    .select("id, name")
    .order("name");

  if (error) throw new Error(`Failed to load classes: ${error.message}`);
  return (data ?? []) as ClassItem[];
}

export async function getTimetableSlots(classId: number, dayOfWeek: string): Promise<TimetableSlot[]> {
  const supabase = createServerAdminClient();

  const { data, error } = await (supabase as any)
    .from("timetable")
    .select("id, subject_name, start_time, end_time")
    .eq("class_id", classId)
    .eq("day_of_week", dayOfWeek)
    .order("start_time");

  if (error) throw new Error(`Failed to load timetable: ${error.message}`);

  return (data ?? []).map((slot: any) => ({
    id: slot.id,
    subject_name: slot.subject_name ?? "Unknown Subject",
    start_time: slot.start_time,
    end_time: slot.end_time,
  }));
}

export async function getAttendanceRoster(classId: number, timetableId: number, dateString: string): Promise<RosterStudent[]> {
  const supabase = createServerAdminClient();

  const { data: students, error: studentError }: any = await supabase
    .from("students")
    .select(`
      id,
      profiles!profile_id (
        full_name
      )
    `)
    .eq("class_id", classId);

  if (studentError) throw new Error(`Failed to fetch student profile rows: ${studentError.message}`);

  const { data: recordedAttendance, error: attendanceError }: any = await supabase
    .from("attendance")
    .select("student_id, status")
    .eq("timetable_id", timetableId)
    .eq("date", dateString);

  if (attendanceError) throw new Error(`Failed to cross-reference logs: ${attendanceError.message}`);

  return (students ?? []).map((student: any, index: number) => {
    const savedRecord = recordedAttendance?.find((rec: any) => rec.student_id === student.id);
    return {
      student_id: student.id,
      roll_no: index + 1,
      name: student.profiles?.full_name ?? "Unknown Name Reference",
      status: savedRecord?.status ?? "Present",
    };
  });
}

export async function saveAttendanceRoster(
  records: { student_id: number; timetable_id: number; date: string; status: string }[]
): Promise<{ success: boolean }> {
  const supabase = createServerAdminClient();

  const { error }: any = await supabase
    .from("attendance")
    .upsert(records, { onConflict: "student_id,timetable_id,date" });

  if (error) throw new Error(`Failed saving attendance: ${error.message}`);
  return { success: true };
}
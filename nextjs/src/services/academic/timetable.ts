"use server";

import { createServerAdminClient } from "@/lib/supabase/serverAdminClient";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TimetableEntry {
  id: number;
  section_id: number;
  day_of_week: string;
  period_number: number;
  start_time: string | null;
  end_time: string | null;
  academic_year_id: number | null;
  subjects: {
    id: number;
    name: string;
    code: string;
  } | null;
  teachers: {
    id: number;
    profiles: {
      full_name: string | null;
    } | null;
  } | null;
}

export interface UpsertTimetableSlotInput {
  section_id: number;
  day_of_week: string;
  period_number: number;
  subject_id: number | null;
  teacher_id: number | null;
  start_time?: string | null;
  end_time?: string | null;
  academic_year_id?: number | null;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Fetch all timetable entries for a given section, with subject and teacher joined.
 */
export async function getTimetableBySection(sectionId: number): Promise<TimetableEntry[]> {
  const supabase = createServerAdminClient();

  const { data, error } = await (supabase as any)
    .from("timetable")
    .select(`
      id,
      section_id,
      day_of_week,
      period_number,
      start_time,
      end_time,
      academic_year_id,
      subjects ( id, name, code ),
      teachers (
        id,
        profiles!profile_id ( full_name )
      )
    `)
    .eq("section_id", sectionId)
    .order("period_number", { ascending: true });

  if (error) throw new Error(`Failed to fetch timetable: ${error.message}`);
  return data || [];
}

// ─── Mutations ────────────────────────────────────────────────────────────────
export async function upsertTimetableSlot(
  input: UpsertTimetableSlotInput
): Promise<TimetableEntry> {
  const supabase = createServerAdminClient();

  const SELECT_SHAPE = `
    id,
    section_id,
    day_of_week,
    period_number,
    start_time,
    end_time,
    academic_year_id,
    subjects ( id, name, code ),
    teachers (
      id,
      profiles!profile_id ( full_name )
    )
  `;

  // 1. Check if a slot already exists for this section + day + period
  const { data: existing } = await (supabase as any)
    .from("timetable")
    .select("id")
    .eq("section_id", input.section_id)
    .eq("day_of_week", input.day_of_week)
    .eq("period_number", input.period_number)
    .maybeSingle();

  const payload = {
    subject_id:       input.subject_id,
    teacher_id:       input.teacher_id,
    start_time:       input.start_time       ?? null,
    end_time:         input.end_time         ?? null,
    academic_year_id: input.academic_year_id ?? null,
  };

  // 2. UPDATE if exists, INSERT if not
  if (existing?.id) {
    const { data, error } = await (supabase as any)
      .from("timetable")
      .update(payload)
      .eq("id", existing.id)
      .select(SELECT_SHAPE)
      .single();

    if (error) throw new Error(`Failed to save timetable slot: ${error.message}`);
    return data;
  } else {
    const { data, error } = await (supabase as any)
      .from("timetable")
      .insert({
        section_id:    input.section_id,
        day_of_week:   input.day_of_week,
        period_number: input.period_number,
        ...payload,
      })
      .select(SELECT_SHAPE)
      .single();

    if (error) throw new Error(`Failed to save timetable slot: ${error.message}`);
    return data;
  }
}
/**
 * Hard-delete a timetable slot by its primary key.
 */
export async function deleteTimetableSlot(id: number): Promise<void> {
  const supabase = createServerAdminClient();

  const { error } = await (supabase as any)
    .from("timetable")
    .delete()
    .eq("id", id);

  if (error) throw new Error(`Failed to delete timetable slot: ${error.message}`);
}
"use server";

import { createServerAdminClient } from "@/lib/supabase/serverAdminClient";

export async function getAcademicYears() {
  const supabase = createServerAdminClient();
  
  const { data, error } = await supabase
    .from("academic_years")
    .select("*")
    .order("name", { ascending: false });

  if (error) throw new Error(`Failed to fetch academic calendar indexes: ${error.message}`);
  return data || [];
}

export async function addAcademicYear(
  name: string, 
  isCurrent: boolean, 
  startDate: string, 
  endDate: string
) {
  const supabase = createServerAdminClient();

  // If this year is set to active/current, clear out any other active years first
  if (isCurrent) {
    const { error: resetError } = await supabase
      .from("academic_years")
      .update({ is_current: false })
      .eq("is_current", true);
      
    if (resetError) console.warn("Notice: Previous active state flags could not be dropped cleanly.");
  }

  const { data, error } = await supabase
    .from("academic_years")
    .insert({
      name,
      is_current: isCurrent,
      start_date: startDate,
      end_date: endDate,
    })
    .select()
    .single();

  if (error) throw new Error(`Could not record academic year: ${error.message}`);
  return data;
}

export async function setYearAsCurrent(id: number) {
  const supabase = createServerAdminClient();

  // 1. Unset all current years
  await supabase.from("academic_years").update({ is_current: false }).eq("is_current", true);

  // 2. Set the target row to current
  const { error } = await supabase
    .from("academic_years")
    .update({ is_current: true })
    .eq("id", id);

  if (error) throw new Error(`Failed to switch active timeline tracking: ${error.message}`);
  return { success: true };
}
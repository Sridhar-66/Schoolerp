import { createClient } from "@/lib/supabase/client";
import { SupabaseClient } from "@supabase/supabase-js";

// Ensure this path points exactly to the file where you pasted those types
import type { Database } from "@/types/supabase"; 

// 1. Extend the strict database row with your UI-specific properties
export type Announcement = Database["public"]["Tables"]["announcements"]["Row"] & {
  poster_name?: string | null;
  category?: string | null; // Safe fallback helper for UI tags
};

// 2. Map the insert type directly to the database rules
export type CreateAnnouncementInput = Database["public"]["Tables"]["announcements"]["Insert"];

// THE FIX: Intercept the generic client and force-cast it to your exact Database type.
// This overrides the broken "Version 12" fallback and forces the "14.5" schema.
const getDb = () => createClient() as unknown as SupabaseClient<Database>;

/**
 * Fetches all announcements sequentially across the platform
 */
export async function getAnnouncements(): Promise<Announcement[]> {
  const supabase = getDb();
  
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

/**
 * Fetches announcements targeted explicitly at teachers or global audiences
 */
/**
 * Fetches announcements visible to teachers (including global, teacher-facing, and student updates)
 */
export async function getTeacherAnnouncements(): Promise<Announcement[]> {
  const supabase = getDb();

  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("is_active", true)
    // 🇧🇷 ADDED 'target_type.eq.students' so teachers can see their own outbound student notices!
    .or("target_type.eq.all,target_type.eq.teachers,target_type.eq.students")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

/**
 * Inserts a freshly created announcement into the Postgres database
 */
export async function createAnnouncement(input: CreateAnnouncementInput): Promise<Announcement> {
  const supabase = getDb();

  const { data, error } = await supabase
    .from("announcements")
    .insert(input)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Announcement;
}

/**
 * Toggles a notice state between active and suspended
 */
export async function toggleAnnouncementActive(id: number, nextState: boolean): Promise<void> {
  const supabase = getDb();

  const { error } = await supabase
    .from("announcements")
    .update({ is_active: nextState })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

/**
 * Destructively drops an announcement row by its unique ID
 */
export async function deleteAnnouncement(id: number): Promise<void> {
  const supabase = getDb();

  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
}
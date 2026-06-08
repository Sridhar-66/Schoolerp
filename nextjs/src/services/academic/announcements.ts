import { createClient } from "@/lib/supabase/client";
import { SupabaseClient } from "@supabase/supabase-js";

// 👉 Ensure this path points exactly to the file where you pasted those types
import type { Database } from "@/types/supabase"; 

// 1. Extend the strict database row with your UI-specific properties
export type Announcement = Database["public"]["Tables"]["announcements"]["Row"] & {
  poster_name?: string | null;
};

// 2. Map the insert type directly to the database rules
export type CreateAnnouncementInput = Database["public"]["Tables"]["announcements"]["Insert"];

// 🔥 THE FIX: Intercept the generic client and force-cast it to your exact Database type.
// This overrides the broken "Version 12" fallback and forces the "14.5" schema.
const getDb = () => createClient() as unknown as SupabaseClient<Database>;

export async function getAnnouncements(): Promise<Announcement[]> {
  const supabase = getDb();
  
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

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

export async function toggleAnnouncementActive(id: number, nextState: boolean): Promise<void> {
  const supabase = getDb();

  const { error } = await supabase
    .from("announcements")
    .update({ is_active: nextState })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function deleteAnnouncement(id: number): Promise<void> {
  const supabase = getDb();

  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
}
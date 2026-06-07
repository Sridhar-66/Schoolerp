"use server";

import { createServerAdminClient } from "@/lib/supabase/serverAdminClient";

export interface Announcement {
  id: number;
  title: string;
  body: string;
  target: string | null;
  target_type: string;
  is_active: boolean;
  expires_at: string | null;
  created_at: string | null;
  created_by: string | null;
  poster_name?: string;
}

export interface CreateAnnouncementInput {
  title: string;
  body: string;
  target_type: string;
  target: string | null;
  expires_at: string | null;
  created_by: string;
}

export async function getAnnouncements(): Promise<Announcement[]> {
  const supabase = createServerAdminClient();

  const { data, error } = await (supabase as any)
    .from("announcements")
    .select("id, title, body, target, target_type, is_active, expires_at, created_at, created_by, profiles(full_name)")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch announcements: ${error.message}`);
  }

  return (data || []).map((a: any) => ({
    id: a.id,
    title: a.title,
    body: a.body,
    target: a.target,
    target_type: a.target_type,
    is_active: a.is_active,
    expires_at: a.expires_at,
    created_at: a.created_at,
    created_by: a.created_by,
    poster_name: a.profiles?.full_name ?? "Admin",
  }));
}

export async function createAnnouncement(input: CreateAnnouncementInput): Promise<void> {
  const supabase = createServerAdminClient();

  const { error } = await (supabase as any)
    .from("announcements")
    .insert({
      title: input.title,
      body: input.body,
      target_type: input.target_type,
      target: input.target,
      expires_at: input.expires_at || null,
      created_by: input.created_by,
      is_active: true,
    });

  if (error) {
    throw new Error(`Failed to create announcement: ${error.message}`);
  }
}

export async function toggleAnnouncementActive(id: number, is_active: boolean): Promise<void> {
  const supabase = createServerAdminClient();

  const { error } = await (supabase as any)
    .from("announcements")
    .update({ is_active })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update announcement status: ${error.message}`);
  }
}

export async function deleteAnnouncement(id: number): Promise<void> {
  const supabase = createServerAdminClient();

  const { error } = await (supabase as any)
    .from("announcements")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to delete announcement: ${error.message}`);
  }
}

export async function getStudentAnnouncements(sectionId: number): Promise<Announcement[]> {
  const supabase = createServerAdminClient();

  const now = new Date().toISOString();

  const { data, error } = await (supabase as any)
    .from("announcements")
    .select("id, title, body, target, target_type, created_at")
    .eq("is_active", true)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .or(`target_type.eq.all,and(target_type.eq.role,target.eq.students),and(target_type.eq.section,target.eq.${sectionId})`)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch student announcements: ${error.message}`);
  }

  return data || [];
}
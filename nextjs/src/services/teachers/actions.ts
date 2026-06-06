'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createSSRClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

const teacherCreateSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  employeeId: z.string().nullable().optional(),
  teacherType: z.string().min(1, 'Teacher type is required'),
  joinedDate: z.string().nullable().optional(),
});

const teacherUpdateSchema = teacherCreateSchema.partial().extend({
  id: z.number(),
  profileId: z.string().uuid(),
});

type TeacherCreateInput = z.infer<typeof teacherCreateSchema>;
type TeacherUpdateInput = z.infer<typeof teacherUpdateSchema>;

const getAdminSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = 
    process.env.PRIVATE_SUPABASE_SERVICE_KEY || 
    process.env.SUPABASE_SERVICE_ROLE_KEY || 
    process.env.SUPABASE_SERVICE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Supabase admin credentials missing from environment configuration.');
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
};

export async function createTeacher(formData: TeacherCreateInput) {
  const validated = teacherCreateSchema.safeParse(formData);
  if (!validated.success) return { success: false, error: validated.error.issues[0].message };

  const adminSupabase = getAdminSupabase();
  const { email, password, fullName, employeeId, teacherType, joinedDate } = validated.data;

  const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  });

  if (authError || !authData.user) return { success: false, error: authError?.message || 'Auth failure.' };
  const userId = authData.user.id;

  try {
    await (adminSupabase.from('profiles') as any).upsert({ id: userId, full_name: fullName });
    await (adminSupabase.from('teachers') as any).insert({
      profile_id: userId,
      employee_id: employeeId || null,
      teacher_type: teacherType,
      joined_date: joinedDate || null,
    });
    revalidatePath('/admin/users/teachers');
    return { success: true };
  } catch (dbError: any) {
    await adminSupabase.auth.admin.deleteUser(userId);
    return { success: false, error: dbError.message };
  }
}

export async function getTeachers() {
  const supabase = await createSSRClient();
  const { data, error } = await (supabase.from('teachers') as any)
    .select('id, employee_id, teacher_type, joined_date, profile_id, profiles(full_name)')
    .order('id', { ascending: false });

  if (error) return { success: false, error: error.message, data: [] };
  return { success: true, data };
}

// New action added here to pull a single teacher record for viewing/editing
export async function getTeacherById(id: number) {
  const supabase = await createSSRClient();
  const { data, error } = await (supabase.from('teachers') as any)
    .select('id, employee_id, teacher_type, joined_date, profile_id, profiles(full_name)')
    .eq('id', id)
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function updateTeacher(formData: TeacherUpdateInput) {
  const validated = teacherUpdateSchema.safeParse(formData);
  if (!validated.success) return { success: false, error: validated.error.issues[0].message };

  const supabase = await createSSRClient();
  const { id, profileId, fullName, employeeId, teacherType, joinedDate } = validated.data;

  if (fullName) {
    await (supabase.from('profiles') as any).update({ full_name: fullName }).eq('id', profileId);
  }

  const { error: teacherError } = await (supabase.from('teachers') as any)
    .update({
      employee_id: employeeId !== undefined ? employeeId : undefined,
      teacher_type: teacherType,
      joined_date: joinedDate !== undefined ? joinedDate : undefined,
    })
    .eq('id', id);

  if (teacherError) return { success: false, error: teacherError.message };

  revalidatePath('/admin/users/teachers');
  return { success: true };
}

export async function deleteTeacher(profileId: string) {
  if (!profileId) return { success: false, error: 'Valid profile ID required.' };
  const adminSupabase = getAdminSupabase();
  const { error } = await adminSupabase.auth.admin.deleteUser(profileId);

  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/users/teachers');
  return { success: true };
}
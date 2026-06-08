import { createSSRSassClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Helper function to validate session and resolve internal teacher integer ID
async function getAuthenticatedTeacherId(supabase: any) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized access. Secure session missing.");
  }

  const { data: teacherProfile, error: profileError } = await (supabase
    .from("teachers") as any)
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (profileError || !teacherProfile) {
    throw new Error("Teacher profile matching this user session could not be found.");
  }

  return teacherProfile.id;
}

// 1. GET ALL ASSIGNMENTS FOR LOGGED-IN TEACHER
export async function GET(request: Request) {
  try {
    const sassClient = await createSSRSassClient();
    const supabase = sassClient.getSupabaseClient();
    const internalTeacherId = await getAuthenticatedTeacherId(supabase);

    // Fetch assignments and join related subject/section info
    const { data, error } = await (supabase.from("assignments") as any)
      .select(`
        id,
        title,
        description,
        due_date,
        subject_id,
        section_id,
        subject:subjects (name, code),
        section:sections (name)
      `)
      .eq("teacher_id", internalTeacherId)
      .order("due_date", { ascending: true });

    if (error) throw error;

    // Optional: If you track question counts, you can calculate or mock it here to prevent client crashes
    const formattedData = data?.map((assignment: any) => ({
      ...assignment,
      question_count: assignment.question_count || 0, 
    })) || [];

    return NextResponse.json({ data: formattedData }, { status: 200 });
  } catch (error: any) {
    const status = error.message.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ error: error.message || "Failed to fetch assignments" }, { status });
  }
}

// 2. CREATE A NEW ASSIGNMENT
export async function POST(request: Request) {
  try {
    const sassClient = await createSSRSassClient();
    const supabase = sassClient.getSupabaseClient();
    const internalTeacherId = await getAuthenticatedTeacherId(supabase);

    const body = await request.json();
    const { title, description, subject_id, section_id, due_date } = body;

    if (!title || !due_date) {
      return NextResponse.json({ error: "Title and Due Date are required." }, { status: 400 });
    }

    const { data, error } = await (supabase.from("assignments") as any)
      .insert([
        {
          title,
          description,
          subject_id,
          section_id,
          due_date,
          teacher_id: internalTeacherId, // Secured server-side enforcement
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create assignment" }, { status: 500 });
  }
}

// 3. UPDATE AN EXISTING ASSIGNMENT
export async function PUT(request: Request) {
  try {
    const sassClient = await createSSRSassClient();
    const supabase = sassClient.getSupabaseClient();
    const internalTeacherId = await getAuthenticatedTeacherId(supabase);

    const body = await request.json();
    const { id, title, description, subject_id, section_id, due_date } = body;

    if (!id) {
      return NextResponse.json({ error: "Assignment ID is required for updates." }, { status: 400 });
    }

    // Update assignment while ensuring it belongs to the authenticated teacher
    const { data, error } = await (supabase.from("assignments") as any)
      .update({ title, description, subject_id, section_id, due_date })
      .eq("id", id)
      .eq("teacher_id", internalTeacherId) 
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update assignment" }, { status: 500 });
  }
}

// 4. DELETE AN ASSIGNMENT
export async function DELETE(request: Request) {
  try {
    const sassClient = await createSSRSassClient();
    const supabase = sassClient.getSupabaseClient();
    const internalTeacherId = await getAuthenticatedTeacherId(supabase);

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Assignment ID is required for deletion." }, { status: 400 });
    }

    // Securely delete only if the assignment belongs to the requesting teacher
    const { error } = await (supabase.from("assignments") as any)
      .delete()
      .eq("id", id)
      .eq("teacher_id", internalTeacherId);

    if (error) throw error;

    return NextResponse.json({ message: "Assignment deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete assignment" }, { status: 500 });
  }
}

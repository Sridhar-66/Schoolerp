import { createSSRSassClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teacher_id = searchParams.get("teacher_id");
    
    if (!teacher_id) {
      return NextResponse.json({ error: "teacher_id is required" }, { status: 400 });
    }

    const sassClient = await createSSRSassClient();
    const supabase = sassClient.getSupabaseClient();

    // Fetch assignments with aliased joins and count aggregations
    const { data, error } = await (supabase.from('assignments') as any)
      .select(`
        *,
        subject:subjects (name),
        section:sections (name),
        assignment_questions (count)
      `)
      .eq('teacher_id', parseInt(teacher_id))
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Map through data to format potential null values safely for the client UI
    const formattedData = data?.map((assignment: any) => ({
      ...assignment,
      // Ensure the keys match what your page.tsx frontend is expecting
      subject: assignment.subject ? assignment.subject : null,
      section: assignment.section ? assignment.section : null,
      // Pull count out of the aggregated array structure safely
      question_count: assignment.assignment_questions?.[0]?.count || 0
    }));

    return NextResponse.json({ data: formattedData }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sassClient = await createSSRSassClient();
    const supabase = sassClient.getSupabaseClient();
    const body = await request.json();

    const insertPayload = {
      title: body.title,
      description: body.description,
      subject_id: body.subject_id ? parseInt(body.subject_id) : null,
      section_id: body.section_id ? parseInt(body.section_id) : null,
      teacher_id: body.teacher_id ? parseInt(body.teacher_id) : null,
      due_date: body.due_date,
      created_at: new Date().toISOString()
    };

    const { error } = await (supabase.from('assignments') as any)
      .insert([insertPayload]);

    if (error) throw error;

    return NextResponse.json({ message: "Assignment created successfully" }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const sassClient = await createSSRSassClient();
    const supabase = sassClient.getSupabaseClient();
    const body = await request.json();

    const { id, title, description, subject_id, section_id, due_date } = body;

    if (!id) {
      return NextResponse.json({ error: "Assignment ID is required" }, { status: 400 });
    }

    const updatePayload = {
      title,
      description,
      subject_id: subject_id ? parseInt(subject_id) : null,
      section_id: section_id ? parseInt(section_id) : null,
      due_date
    };

    const { error } = await (supabase.from('assignments') as any)
      .update(updatePayload)
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: "Assignment updated successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const sassClient = await createSSRSassClient();
    const supabase = sassClient.getSupabaseClient();
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Assignment ID is required" }, { status: 400 });
    }

    const { error } = await (supabase.from('assignments') as any)
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: "Assignment deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
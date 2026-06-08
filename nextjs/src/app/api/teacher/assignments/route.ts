import { createSSRSassClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get("teacher_id");
    const date = searchParams.get("date");

    if (!teacherId) {
      return NextResponse.json(
        { error: "teacher_id parameter is required" },
        { status: 400 }
      );
    }

    // Initialize using your template's custom SaaS client pattern
    const sassClient = await createSSRSassClient();
    const supabase = sassClient.getSupabaseClient();

    // Fetch timetable records matching the specific teacher ID
    let query = (supabase.from("timetable") as any)
      .select(`
        id,
        period_number,
        start_time,
        end_time,
        date,
        academic_year_id,
        subject_id,
        subjects:subjects (
          name,
          code
        ),
        sections:sections (
          name
        )
      `)
      .eq("teacher_id", parseInt(teacherId));

    // Optional chronological daily date filter if passed by the frontend view
    if (date) {
      query = query.eq("date", date);
    }

    // Sort items chronologically by class start time
    const { data, error } = await query.order("start_time", { ascending: true });

    if (error) throw error;

    // Map through data structures to protect client views against unexpected null values
    const formattedData = data?.map((entry: any) => ({
      ...entry,
      subjects: entry.subjects ? entry.subjects : null,
      sections: entry.sections ? entry.sections : null,
    })) || [];

    // Return direct array data back to your client-side timetable page component
    return NextResponse.json(formattedData, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process timetable retrieval" },
      { status: 500 }
    );
  }
}
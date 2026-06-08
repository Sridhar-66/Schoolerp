import { createSSRSassClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    // 1. Initialize the secure server-side multi-tenant client wrapper
    const sassClient = await createSSRSassClient();
    const supabase = sassClient.getSupabaseClient();

    // 2. Retrieve user information via verified cookie session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized access. Secure session missing." },
        { status: 401 }
      );
    }

    // 3. Look up internal teacher integer ID matching the authenticated profile_id
    const { data: teacherProfile, error: profileError } = await (supabase
      .from("teachers") as any)
      .select("id")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (profileError) {
      throw new Error(`Profile resolution database error: ${profileError.message}`);
    }

    if (!teacherProfile) {
      return NextResponse.json(
        { error: "Teacher profile matching this authenticated user session could not be found." },
        { status: 404 }
      );
    }

    const internalTeacherId = teacherProfile.id;

    // 4. Query timetable records mapped directly to the resolved teacher integer ID
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
      .eq("teacher_id", internalTeacherId);

    // Filter by date if passed down from client UI filter interaction
    if (date) {
      query = query.eq("date", date);
    }

    const { data: timetableData, error: timetableError } = await query.order("start_time", { ascending: true });

    if (timetableError) throw timetableError;

    // 5. Sanitize and format relation keys cleanly for the layout component UI
    const formattedData = timetableData?.map((entry: any) => ({
      ...entry,
      subjects: entry.subjects ? entry.subjects : null,
      sections: entry.sections ? entry.sections : null,
    })) || [];

    return NextResponse.json(formattedData, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server processing error occurred." },
      { status: 500 }
    );
  }
}
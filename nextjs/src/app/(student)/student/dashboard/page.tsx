"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Announcement = {
  id: number;
  title: string;
  body: string;
  created_at: string | null;
};

type DashboardStats = {
  attendancePercent: number | null;
  pendingAssignments: number | null;
  nextExam: string | null;
};

export default function StudentDashboard() {
  const router = useRouter();
  const [studentId, setStudentId] = useState<number | null>(null);
  const [sectionId, setSectionId] = useState<number | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    attendancePercent: null,
    pendingAssignments: null,
    nextExam: null,
  });
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const supabase = createClient();

        // 1. Get logged-in user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.warn("Dashboard Debug: No authenticated user found.");
          setLoading(false);
          return;
        }

        // 2. Get student record from profile_id
        const { data: studentRaw, error: studentError } = await supabase
          .from("students")
          .select("id, section_id")
          .eq("profile_id", user.id)
          .single();

        if (studentError || !studentRaw) {
          console.error("Dashboard Debug -> Error fetching student row:", studentError);
          setLoading(false);
          return;
        }

        const student = studentRaw as { id: number; section_id: number | null };
        setStudentId(student.id);
        setSectionId(student.section_id);

        if (!student.section_id) {
          console.warn("Dashboard Debug -> Warning: This student has NO section_id assigned in the database!");
        }

        // 3. Fetch all dashboard dependencies in parallel
        const today = new Date().toISOString().split("T")[0];

        const [
          { data: attendanceData, error: attendanceError },
          { data: assignmentsData, error: assignmentsError },
          { data: nextExamData, error: nextExamError },
          { data: announcementsData, error: announcementsError },
        ] = await Promise.all([
          // Attendance: all records for this student
          supabase
            .from("attendance")
            .select("status")
            .eq("student_id", student.id),

          // Pending assignments: due in future for student's section
          supabase
            .from("assignments")
            .select("id")
            .eq("section_id", student.section_id || 0)
            .gte("due_date", today),

          // Next upcoming exam for student's section
          supabase
            .from("exams")
            .select("name, exam_date")
            .eq("section_id", student.section_id || 0)
            .gte("exam_date", today)
            .order("exam_date", { ascending: true })
            .limit(1),

          // Announcements targeted to students or all
          supabase
            .from("announcements")
            .select("id, title, body, created_at")
            .or("target.eq.students,target.eq.all")
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

        // Route hidden error details directly to the inspect console
        if (attendanceError) console.error("Supabase Error (Attendance):", attendanceError.message);
        if (assignmentsError) console.error("Supabase Error (Assignments):", assignmentsError.message);
        if (nextExamError) console.error("Supabase Error (Exams):", nextExamError.message);
        if (announcementsError) console.error("Supabase Error (Announcements):", announcementsError.message);

        // Calculate attendance %
        let attendancePercent: number | null = null;
        if (attendanceData && attendanceData.length > 0) {
          const present = (attendanceData as { status: string }[]).filter(
            (a) => a.status === "present"
          ).length;

          attendancePercent = Math.round((present / attendanceData.length) * 100);
        }

        setStats({
          attendancePercent,
          pendingAssignments: assignmentsData ? assignmentsData.length : null,
          nextExam: (() => {
            const exams = nextExamData as { name: string; exam_date: string }[] | null;
            if (!exams || exams.length === 0) return "None upcoming";
            return `${exams[0].name} — ${new Date(exams[0].exam_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
          })(),
        });

        if (announcementsData) setAnnouncements(announcementsData);
      } catch (err) {
        console.error("Critical Dashboard Exception Caught:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  const statCards = [
    {
      label: "Attendance %",
      value:
        stats.attendancePercent !== null
          ? `${stats.attendancePercent}%`
          : "—",
      color:
        stats.attendancePercent !== null && stats.attendancePercent < 75
          ? "text-red-500"
          : "text-green-600",
    },
    {
      label: "Pending Assignments",
      value:
        stats.pendingAssignments !== null
          ? String(stats.pendingAssignments)
          : "—",
      color: "text-foreground",
    },
    {
      label: "Next Exam",
      value: stats.nextExam ?? "—",
      color: "text-foreground",
      small: true,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Student Dashboard</h1>
        <button
          onClick={handleLogout}
          className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                {s.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-3xl font-bold text-muted-foreground">—</p>
              ) : (
                <p
                  className={`font-bold ${s.color} ${
                    s.small ? "text-lg" : "text-3xl"
                  }`}
                >
                  {s.value}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Announcements */}
      <Card>
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : announcements.length === 0 ? (
            <p className="text-sm text-muted-foreground">No announcements.</p>
          ) : (
            announcements.map((a) => (
              <div
                key={a.id}
                className="flex flex-col gap-1 border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{a.title}</p>
                  {a.created_at && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(a.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{a.body}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
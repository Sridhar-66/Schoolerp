"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StudentInfo = {
  id: number;
  section_id: number | null;
  roll_number: string | null;
  profile: { full_name: string } | null;
  section: { name: string } | null;
};

type Announcement = {
  id: number;
  title: string;
  body: string;
  created_at: string | null;
};

type TimetableEntry = {
  id: number;
  period_number: number;
  start_time: string;
  end_time: string;
  subject: { name: string; code: string } | null;
  teacher: { profile: { full_name: string } | null } | null;
};

type RecentResult = {
  marks_obtained: number | null;
  exam: {
    name: string;
    exam_date: string | null;
    max_marks: number;
    subject: { name: string } | null;
  } | null;
};

type DashboardStats = {
  attendancePercent: number | null;
  totalClasses: number;
  presentClasses: number;
  pendingAssignments: number | null;
  pendingFees: number | null;
  nextExamName: string | null;
  nextExamDate: string | null;
  nextExamSubject: string | null;
  pendingLeave: number | null;
};

function formatTime(t: string) {
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    attendancePercent: null,
    totalClasses: 0,
    presentClasses: 0,
    pendingAssignments: null,
    pendingFees: null,
    nextExamName: null,
    nextExamDate: null,
    nextExamSubject: null,
    pendingLeave: null,
  });
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [todayTimetable, setTodayTimetable] = useState<TimetableEntry[]>([]);
  const [recentResults, setRecentResults] = useState<RecentResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const supabase = createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push("/auth/login"); return; }

        const { data: studentRaw, error: studentErr } = await supabase
          .from("students")
          .select(`id, section_id, roll_number,
             profile:profiles!students_profile_id_fkey(full_name),
             section:sections!students_section_id_fkey(name)`)
          .eq("profile_id", user.id)
          .single();

        if (studentErr || !studentRaw) {
          console.error("Student fetch error:", studentErr);
          setLoading(false);
          return;
        }

        const s = studentRaw as unknown as StudentInfo;
        setStudent(s);

        const today = new Date().toISOString().split("T")[0];

        const [
          { data: attendanceData },
          { data: assignmentsData },
          { data: nextExamData },
          { data: announcementsData },
          { data: timetableData },
          { data: resultsData },
          { data: feeData },
          { data: leaveData },
        ] = await Promise.all([
          supabase.from("attendance").select("status").eq("student_id", s.id),
          supabase.from("assignments").select("id").eq("section_id", s.section_id ?? 0).gte("due_date", today),
          supabase.from("exams").select("name, exam_date, subject:subjects(name)").eq("section_id", s.section_id ?? 0).gte("exam_date", today).order("exam_date", { ascending: true }).limit(1),
          supabase.from("announcements").select("id, title, body, created_at").or("target_type.eq.students,target_type.eq.all").order("created_at", { ascending: false }).limit(4),
          supabase.from("timetable").select(`id, period_number, start_time, end_time, subject:subjects(name, code), teacher:teachers(profile:profiles(full_name))`).eq("section_id", s.section_id ?? 0).eq("date", today).order("period_number", { ascending: true }),
          supabase.from("marks").select(`marks_obtained, exam:exams(name, exam_date, max_marks, subject:subjects(name))`).eq("student_id", s.id).order("entered_at", { ascending: false }).limit(5),
          supabase.from("fee_payments").select("status").eq("student_id", s.id).eq("status", "pending"),
          supabase.from("leave_requests").select("status").eq("student_id", s.id).eq("status", "pending"),
        ]);

        const totalClasses = attendanceData?.length ?? 0;
        const presentClasses = (attendanceData ?? []).filter((a: any) => a.status === "present").length;
        const attendancePercent = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : null;

        const exams = nextExamData as any[];
        const nextExam = exams?.[0] ?? null;

        setTodayTimetable((timetableData ?? []) as unknown as TimetableEntry[]);
        setRecentResults((resultsData ?? []) as unknown as RecentResult[]);
        setAnnouncements((announcementsData ?? []) as Announcement[]);
        setStats({
          attendancePercent, totalClasses, presentClasses,
          pendingAssignments: assignmentsData?.length ?? 0,
          pendingFees: feeData?.length ?? 0,
          nextExamName: nextExam?.name ?? null,
          nextExamDate: nextExam?.exam_date ?? null,
          nextExamSubject: nextExam?.subject?.name ?? null,
          pendingLeave: leaveData?.length ?? 0,
        });
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading dashboard...</p>;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Student Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {student?.profile?.full_name} · {student?.section?.name ?? "—"}
            {student?.roll_number ? ` · Roll No. ${student.roll_number}` : ""}
          </p>
        </div>
        <button onClick={handleLogout} className="rounded-md bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600">
          Logout
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Attendance", value: stats.attendancePercent !== null ? `${stats.attendancePercent}%` : "—", sub: `${stats.presentClasses}/${stats.totalClasses} classes`, href: "/student/attendance" },
          { label: "Assignments Due", value: String(stats.pendingAssignments ?? "—"), sub: "upcoming", href: "/student/assignments" },
          { label: "Fees Pending", value: String(stats.pendingFees ?? "—"), sub: "unpaid items", href: "/student/fees" },
          { label: "Leave Pending", value: String(stats.pendingLeave ?? "—"), sub: "awaiting approval", href: "/student/leave" },
        ].map((c) => (
          <Link key={c.href} href={c.href}>
            <Card className="hover:bg-muted/40 transition-colors cursor-pointer">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm text-muted-foreground font-medium">{c.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{c.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{c.sub}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Next Exam */}
      {stats.nextExamName && (
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground font-medium">Next Exam</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{stats.nextExamName} {stats.nextExamSubject ? `· ${stats.nextExamSubject}` : ""}</p>
            <p className="text-sm text-muted-foreground">
              {stats.nextExamDate ? new Date(stats.nextExamDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "TBA"}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Today's Timetable */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Today's Schedule</CardTitle>
            <Link href="/student/timetable" className="text-xs text-blue-600 hover:underline">Full timetable →</Link>
          </CardHeader>
          <CardContent>
            {todayTimetable.length === 0 ? (
              <p className="text-sm text-muted-foreground">No classes today.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground border-b">
                    <th className="pb-1 font-medium">Period</th>
                    <th className="pb-1 font-medium">Time</th>
                    <th className="pb-1 font-medium">Subject</th>
                    <th className="pb-1 font-medium">Teacher</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {todayTimetable.map((p) => (
                    <tr key={p.id}>
                      <td className="py-1.5 text-muted-foreground">P{p.period_number}</td>
                      <td className="py-1.5 text-muted-foreground whitespace-nowrap">{formatTime(p.start_time)} – {formatTime(p.end_time)}</td>
                      <td className="py-1.5 font-medium">{p.subject?.name ?? "—"}</td>
                      <td className="py-1.5 text-muted-foreground">{p.teacher?.profile?.full_name ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Announcements</CardTitle>
            <Link href="/student/announcements" className="text-xs text-blue-600 hover:underline">See all →</Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {announcements.length === 0 ? (
              <p className="text-sm text-muted-foreground">No announcements.</p>
            ) : (
              announcements.map((a) => (
                <div key={a.id} className="border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm">{a.title}</p>
                    {a.created_at && (
                      <p className="text-xs text-muted-foreground shrink-0">
                        {new Date(a.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{a.body}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Results */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Recent Results</CardTitle>
          <Link href="/student/results" className="text-xs text-blue-600 hover:underline">All results →</Link>
        </CardHeader>
        <CardContent>
          {recentResults.length === 0 ? (
            <p className="text-sm text-muted-foreground">No results yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b">
                  <th className="pb-1 font-medium">Exam</th>
                  <th className="pb-1 font-medium">Subject</th>
                  <th className="pb-1 font-medium">Date</th>
                  <th className="pb-1 font-medium text-right">Marks</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentResults.map((r, i) => (
                  <tr key={i}>
                    <td className="py-1.5 font-medium">{r.exam?.name ?? "—"}</td>
                    <td className="py-1.5 text-muted-foreground">{r.exam?.subject?.name ?? "—"}</td>
                    <td className="py-1.5 text-muted-foreground">
                      {r.exam?.exam_date ? new Date(r.exam.exam_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                    </td>
                    <td className="py-1.5 text-right font-semibold">
                      {r.marks_obtained ?? "—"} / {r.exam?.max_marks ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
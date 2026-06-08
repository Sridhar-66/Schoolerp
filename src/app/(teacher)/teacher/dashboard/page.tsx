"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type TeacherInfo = {
  id: number;
  profile: { full_name: string } | null;
};

type TimetableSlot = {
  id: number;
  period_number: number;
  start_time: string;
  end_time: string;
  subject: { name: string; code: string } | null;
  section: { name: string; class: { name: string } | null } | null;
};

type RecentAssignment = {
  id: number;
  title: string;
  due_date: string;
  section: { name: string; class: { name: string } | null } | null;
};

type DashboardStats = {
  assignedSections: number;
  pendingSubmissions: number;
  upcomingExams: number;
};

function formatTime(t: string) {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

export default function TeacherDashboard() {
  const router = useRouter();
  const [teacher, setTeacher] = useState<TeacherInfo | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    assignedSections: 0,
    pendingSubmissions: 0,
    upcomingExams: 0,
  });
  const [todayTimetable, setTodayTimetable] = useState<TimetableSlot[]>([]);
  const [recentAssignments, setRecentAssignments] = useState<RecentAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const supabase = createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/auth/login");
          return;
        }

        const { data: teacherRaw, error: teacherErr } = await supabase
          .from("teachers")
          .select(`
            id,
            profile:profiles!teachers_profile_id_fkey(full_name)
          `)
          .eq("profile_id", user.id)
          .single();

        if (teacherErr || !teacherRaw) {
          console.error("Teacher fetch error:", teacherErr);
          setLoading(false);
          return;
        }

        const t = teacherRaw as unknown as TeacherInfo;
        setTeacher(t);

        const today = new Date().toISOString().split("T")[0];

        const [
          sectionsCount,
          submissionsCount,
          examsCount,
          timetableData,
          assignmentsData,
        ] = await Promise.all([
          supabase.from("section_teachers").select("section_id", { count: "exact", head: true }).eq("teacher_id", t.id),
          supabase.from("assignment_submissions").select("id, assignment:assignments!inner(teacher_id)", { count: "exact", head: true }).eq("assignments.teacher_id", t.id),
          supabase.from("exams").select("id", { count: "exact", head: true }).gte("exam_date", today),
          supabase.from("timetable").select(`id, period_number, start_time, end_time, subject:subjects(name, code), section:sections(name, class:classes(name))`).eq("teacher_id", t.id).eq("date", today).order("period_number", { ascending: true }),
          supabase.from("assignments").select(`id, title, due_date, section:sections(name, class:classes(name))`).eq("teacher_id", t.id).order("created_at", { ascending: false }).limit(5),
        ]);

        setTodayTimetable((timetableData.data ?? []) as unknown as TimetableSlot[]);
        setRecentAssignments((assignmentsData.data ?? []) as unknown as RecentAssignment[]);
        setStats({
          assignedSections: sectionsCount.count || 0,
          pendingSubmissions: submissionsCount.count || 0,
          upcomingExams: examsCount.count || 0,
        });
      } catch (err) {
        console.error("Teacher Dashboard Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  if (loading) return <p className="text-sm text-muted-foreground p-6">Loading teacher profile...</p>;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {teacher?.profile?.full_name ?? "Educator"}
          </p>
        </div>
        <button onClick={handleLogout} className="rounded-md bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600 transition-colors">
          Logout
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {[
          { label: "Assigned Sections", value: stats.assignedSections, sub: "active rosters", href: "/teacher/sections" },
          { label: "Submissions Received", value: stats.pendingSubmissions, sub: "awaiting review", href: "/teacher/submissions", highlight: true },
          { label: "Scheduled Evaluations", value: stats.upcomingExams, sub: "upcoming tests", href: "/teacher/exams" },
        ].map((c, idx) => (
          <Link key={idx} href={c.href}>
            <Card className="hover:bg-muted/40 transition-colors cursor-pointer">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm text-muted-foreground font-medium">{c.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-3xl font-bold ${c.highlight ? "text-amber-600" : ""}`}>{c.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{c.sub}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Today's Teaching Schedule</CardTitle>
            <Link href="/teacher/timetable" className="text-xs text-blue-600 hover:underline">Full schedule →</Link>
          </CardHeader>
          <CardContent>
            {todayTimetable.length === 0 ? (
              <p className="text-sm text-muted-foreground">No assigned periods for today.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Period</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Class & Section</TableHead>
                    <TableHead>Subject</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todayTimetable.map((slot) => (
                    <TableRow key={slot.id}>
                      <TableCell className="text-muted-foreground">P{slot.period_number}</TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {slot.section?.class?.name} ({slot.section?.name ?? "—"})
                      </TableCell>
                      <TableCell>{slot.subject?.name ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
                )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Recent Assignments Issued</CardTitle>
            <Link href="/teacher/assignments" className="text-xs text-blue-600 hover:underline">Manage tasks →</Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {recentAssignments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No assignments generated yet.</p>
            ) : (
              recentAssignments.map((assignment) => (
                <div key={assignment.id} className="border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm">{assignment.title}</p>
                    <span className="text-xs font-medium text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 px-2 py-0.5 rounded shrink-0">
                      Due: {new Date(assignment.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Target: {assignment.section?.class?.name} — Sec {assignment.section?.name ?? "—"}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

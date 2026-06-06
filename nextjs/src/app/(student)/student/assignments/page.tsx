"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Assignment {
  id: number;
  title: string;
  description: string | null;
  due_date: string;
  subjects: {
    name: string;
  } | null;
}

interface Submission {
  assignment_id: number;
  submitted_at: string;
  grade: string | null;
  feedback: string | null;
}

export default function StudentAssignmentsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Record<number, Submission>>({});

  useEffect(() => {
    async function fetchAssignmentsAndSubmissions() {
      try {
        setLoading(true);

        // ⚠️ Critical Pattern Match: Student Identity Verification
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError("User session not found.");
          return;
        }

        const { data: studentRaw } = await supabase
          .from("students")
          .select("id, section_id")
          .eq("profile_id", user.id)
          .single();

        const student = studentRaw as { id: number; section_id: number } | null;
        if (!student) {
          setError("Student profile context missing.");
          return;
        }

        // 1. Fetch assignments matching student's section
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from("assignments")
          .select(`
            id,
            title,
            description,
            due_date,
            subjects (
              name
            )
          `)
          .eq("section_id", student.section_id)
          .order("due_date", { ascending: true });

        if (assignmentsError) throw assignmentsError;

        // 2. Fetch student's custom submissions
        const { data: submissionsData, error: submissionsError } = await supabase
          .from("assignment_submissions")
          .select("assignment_id, submitted_at, grade, feedback")
          .eq("student_id", student.id);

        if (submissionsError) throw submissionsError;

        // 💡 Explicitly type-cast both datasets to eliminate any Supabase generic 'never' leaks
        const typedAssignments = (assignmentsData as unknown as Assignment[]) || [];
        const typedSubmissions = (submissionsData as any[]) || [];

        // Map submissions lookup dictionary by assignment_id safely
        const submissionsMap: Record<number, Submission> = {};
        typedSubmissions.forEach((sub) => {
          submissionsMap[sub.assignment_id] = {
            assignment_id: sub.assignment_id,
            submitted_at: sub.submitted_at,
            grade: sub.grade,
            feedback: sub.feedback,
          };
        });

        setAssignments(typedAssignments);
        setSubmissions(submissionsMap);
      } catch (err: any) {
        console.error("Assignments Fetch Error:", err);
        setError(err.message || "Failed to load academic assignments.");
      } finally {
        setLoading(false);
      }
    }

    fetchAssignmentsAndSubmissions();
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-muted-foreground animate-pulse font-medium">Loading your assignments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-xl mx-auto my-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const totalCount = assignments.length;
  const completedCount = Object.keys(submissions).length;
  const pendingCount = totalCount - completedCount;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Assignments</h1>
        <p className="text-muted-foreground mt-1">Track pending projects, homework, coursework dues, and grading returns.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-muted/20">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Total Issued</CardTitle>
          </CardHeader>
          <CardContent className="py-1 px-4 font-bold text-2xl text-foreground">{totalCount}</CardContent>
        </Card>
        <Card className="bg-emerald-50/20 border-emerald-500/10">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-xs font-semibold tracking-wider text-emerald-600 uppercase">Submitted</CardTitle>
          </CardHeader>
          <CardContent className="py-1 px-4 font-bold text-2xl text-emerald-600">{completedCount}</CardContent>
        </Card>
        <Card className="bg-amber-50/20 border-amber-500/10">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-xs font-semibold tracking-wider text-amber-600 uppercase">Pending Review</CardTitle>
          </CardHeader>
          <CardContent className="py-1 px-4 font-bold text-2xl text-amber-600">{pendingCount}</CardContent>
        </Card>
      </div>

      <div className="rounded-md border bg-background shadow-2xs">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="px-4 py-3 font-semibold text-foreground">Assignment Title</TableHead>
              <TableHead className="px-4 py-3 font-semibold text-foreground">Subject</TableHead>
              <TableHead className="px-4 py-3 font-semibold text-foreground">Due Date</TableHead>
              <TableHead className="px-4 py-3 font-semibold text-foreground">Status</TableHead>
              <TableHead className="px-4 py-3 font-semibold text-foreground">Grade / Outcome</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.length === 0 ? (
              <TableRow>
                <td colSpan={5} className="text-center text-muted-foreground py-10 font-medium">
                  No assignments have been assigned to your section yet.
                </td>
              </TableRow>
            ) : (
              assignments.map((assignment) => {
                const submission = submissions[assignment.id];
                const isOverdue = !submission && new Date(assignment.due_date) < new Date();

                return (
                  <TableRow key={assignment.id} className="hover:bg-muted/5 transition-colors align-top">
                    <td className="px-4 py-3.5 max-w-sm">
                      <div className="font-semibold text-foreground text-sm">{assignment.title}</div>
                      {assignment.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                          {assignment.description}
                        </p>
                      )}
                      {submission?.feedback && (
                        <div className="mt-2 p-2 rounded bg-muted/40 border border-dashed text-xs text-foreground/90">
                          <span className="font-semibold text-[11px] block text-primary uppercase tracking-wide">Teacher Feedback:</span>
                          {submission.feedback}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3.5 align-middle">
                      <span className="text-sm text-foreground font-medium">
                        {assignment.subjects?.name || "—"}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 align-middle text-sm font-mono whitespace-nowrap text-muted-foreground">
                      {formatDate(assignment.due_date)}
                    </td>

                    <td className="px-4 py-3.5 align-middle">
                      {submission ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                          Submitted
                        </span>
                      ) : isOverdue ? (
                        <span className="inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive border border-destructive/20">
                          Overdue
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                          Pending
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 align-middle">
                      {submission?.grade ? (
                        <span className="inline-flex items-center font-mono font-bold text-sm text-primary px-2 py-0.5 rounded bg-primary/5 border border-primary/20">
                          {submission.grade}
                        </span>
                      ) : submission ? (
                        <span className="text-xs text-muted-foreground italic">Awaiting Grade</span>
                      ) : (
                        <span className="text-muted-foreground/40 font-light text-sm">—</span>
                      )}
                    </td>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
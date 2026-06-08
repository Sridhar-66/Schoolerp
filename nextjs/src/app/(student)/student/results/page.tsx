"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getStudentResults } from "@/services/academic/results";
import { computeResultsSummary, type StudentResultRow, type ResultsSummary } from "@/services/academic/results-helpers";

function GradeBadge({ grade }: { grade: string | null }) {
  if (!grade) return <span className="text-muted-foreground">--</span>;
  const colors: Record<string, string> = {
    "A+": "bg-emerald-100 text-emerald-700",
    A: "bg-green-100 text-green-700",
    "B+": "bg-blue-100 text-blue-700",
    B: "bg-sky-100 text-sky-700",
    C: "bg-yellow-100 text-yellow-700",
    D: "bg-orange-100 text-orange-700",
    F: "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${colors[grade] ?? "bg-muted text-muted-foreground"}`}>
      {grade}
    </span>
  );
}

function PercentBar({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="text-muted-foreground text-sm">N/A</span>;
  const color = pct >= 75 ? "bg-green-500" : pct >= 50 ? "bg-yellow-400" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm tabular-nums">{pct}%</span>
    </div>
  );
}

export default function StudentResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<StudentResultRow[]>([]);
  const [summary, setSummary] = useState<ResultsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterSubject, setFilterSubject] = useState<string>("all");

  useEffect(() => {
    const init = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setError("Not authenticated."); setLoading(false); return; }
        const { data: student, error: sErr } = await supabase
          .from("students").select("id").eq("profile_id", user.id).single();
        if (sErr || !student) { setError("Could not load student record."); setLoading(false); return; }
        const data = await getStudentResults((student as { id: number }).id);
        setResults(data);
        setSummary(computeResultsSummary(data));
      } catch (e: any) {
        setError(e.message ?? "Failed to load results.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const yearOptions = Array.from(new Set(results.map((r) => r.academic_year_name).filter(Boolean))) as string[];
  const subjectOptions = Array.from(new Set(results.map((r) => r.subject_name).filter(Boolean))) as string[];
  const filtered = results.filter((r) => {
    if (filterYear !== "all" && r.academic_year_name !== filterYear) return false;
    if (filterSubject !== "all" && r.subject_name !== filterSubject) return false;
    return true;
  });

  const sel = "h-9 rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">My Results</h1>

      {!loading && !error && summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Exams Appeared</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-3xl font-bold">{summary.appeared}<span className="text-base font-normal text-muted-foreground">/{summary.totalExams}</span></p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Overall %</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className={`text-3xl font-bold ${summary.overallPercentage === null ? "text-muted-foreground" : summary.overallPercentage >= 75 ? "text-green-600" : summary.overallPercentage >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                {summary.overallPercentage !== null ? `${summary.overallPercentage}%` : "--"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Overall Grade</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-3xl font-bold">{summary.overallGrade ?? "--"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Marks</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-3xl font-bold">{summary.totalMarksObtained}<span className="text-base font-normal text-muted-foreground">/{summary.totalMaxMarks}</span></p>
            </CardContent>
          </Card>
        </div>
      )}

      {!loading && !error && results.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          <select className={sel} value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
            <option value="all">All Academic Years</option>
            {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select className={sel} value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
            <option value="all">All Subjects</option>
            {subjectOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Exam</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Marks</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead>Remarks</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-10">Loading results...</TableCell></TableRow>
          ) : error ? (
            <TableRow><TableCell colSpan={7} className="text-center text-red-500 py-10">{error}</TableCell></TableRow>
          ) : filtered.length === 0 ? (
            <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-10">No results found.</TableCell></TableRow>
          ) : (
            filtered.map((r) => (
              <TableRow key={r.exam_id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => router.push(`/student/results/${r.exam_id}`)}>
                <TableCell className="font-medium">{r.exam_name}</TableCell>
                <TableCell>
                  <span className="font-medium">{r.subject_name ?? "--"}</span>
                  {r.subject_code && <span className="ml-1 text-xs text-muted-foreground">({r.subject_code})</span>}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {r.exam_date ? new Date(r.exam_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "--"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {r.marks_obtained !== null
                    ? <><span className="font-semibold">{r.marks_obtained}</span><span className="text-muted-foreground">/{r.max_marks}</span></>
                    : <span className="text-muted-foreground">Pending</span>}
                </TableCell>
                <TableCell><PercentBar pct={r.percentage} /></TableCell>
                <TableCell><GradeBadge grade={r.grade} /></TableCell>
                <TableCell className="text-muted-foreground text-sm">{r.remarks ?? "--"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
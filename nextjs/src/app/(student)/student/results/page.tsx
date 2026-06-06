"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Exam = {
  id: number;
  name: string;
  exam_date: string | null;
  max_marks: number;
};

type Mark = {
  id: number;
  marks_obtained: number | null;
  remarks: string | null;
  exams: {
    name: string;
    max_marks: number;
    exam_date: string | null;
  } | null;
  subjects: {
    name: string;
    code: string;
  } | null;
};

function getGrade(obtained: number, max: number): string {
  const pct = (obtained / max) * 100;
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B+";
  if (pct >= 60) return "B";
  if (pct >= 50) return "C";
  if (pct >= 35) return "D";
  return "F";
}

function gradeColor(grade: string): string {
  if (grade === "A+" || grade === "A") return "text-green-600";
  if (grade === "B+" || grade === "B") return "text-blue-600";
  if (grade === "C") return "text-yellow-600";
  if (grade === "D") return "text-orange-500";
  return "text-red-500";
}

const sel =
  "h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

export default function StudentResultsPage() {
  const [studentId, setStudentId] = useState<number | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [marks, setMarks] = useState<Mark[]>([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [loadingMarks, setLoadingMarks] = useState(false);

  // Step 1: Get student + exams for their section
  useEffect(() => {
    const fetchInitial = async () => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: studentRaw } = await supabase
        .from("students")
        .select("id, section_id")
        .eq("profile_id", user.id)
        .single();

      const student = studentRaw as {
        id: number;
        section_id: number;
      } | null;
      if (!student) return;

      setStudentId(student.id);

      const { data: examData } = await supabase
        .from("exams")
        .select("id, name, exam_date, max_marks")
        .eq("section_id", student.section_id)
        .order("exam_date", { ascending: false });

      if (examData) {
        setExams(examData as Exam[]);
        if (examData.length > 0) {
          setSelectedExamId(String((examData as Exam[])[0].id));
        }
      }
      setLoadingExams(false);
    };

    fetchInitial();
  }, []);

  // Step 2: Fetch marks when exam is selected
  useEffect(() => {
    if (!selectedExamId || !studentId) return;

    const fetchMarks = async () => {
      setLoadingMarks(true);
      const supabase = createClient();

      const { data } = await supabase
        .from("marks")
        .select(`
          id,
          marks_obtained,
          remarks,
          exams ( name, max_marks, exam_date ),
          subjects ( name, code )
        `)
        .eq("exam_id", Number(selectedExamId))
        .eq("student_id", studentId);

      if (data) setMarks(data as unknown as Mark[]);
      setLoadingMarks(false);
    };

    fetchMarks();
  }, [selectedExamId, studentId]);

  const totalObtained = marks.reduce(
    (sum, m) => sum + (m.marks_obtained ?? 0),
    0
  );
  const totalMax = marks.reduce(
    (sum, m) => sum + (m.exams?.max_marks ?? 0),
    0
  );
  const overallPct =
    totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">My Results</h1>

      {/* Exam selector */}
      {loadingExams ? (
        <p className="text-sm text-muted-foreground">Loading exams...</p>
      ) : exams.length === 0 ? (
        <p className="text-sm text-muted-foreground">No exams found.</p>
      ) : (
        <select
          className={sel + " w-64"}
          value={selectedExamId}
          onChange={(e) => setSelectedExamId(e.target.value)}
        >
          {exams.map((e) => (
            <option key={e.id} value={String(e.id)}>
              {e.name}
              {e.exam_date
                ? ` — ${new Date(e.exam_date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}`
                : ""}
            </option>
          ))}
        </select>
      )}

      {/* Summary cards */}
      {!loadingMarks && marks.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                Total Marks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {totalObtained} / {totalMax}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                Percentage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`text-2xl font-bold ${
                  overallPct !== null && overallPct < 35
                    ? "text-red-500"
                    : overallPct !== null && overallPct >= 75
                    ? "text-green-600"
                    : "text-foreground"
                }`}
              >
                {overallPct !== null ? `${overallPct}%` : "—"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                Overall Grade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`text-2xl font-bold ${
                  overallPct !== null
                    ? gradeColor(getGrade(totalObtained, totalMax))
                    : ""
                }`}
              >
                {overallPct !== null
                  ? getGrade(totalObtained, totalMax)
                  : "—"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Marks table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Marks Obtained</TableHead>
            <TableHead>Max Marks</TableHead>
            <TableHead>Percentage</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead>Remarks</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loadingMarks ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-muted-foreground py-8"
              >
                Loading...
              </TableCell>
            </TableRow>
          ) : marks.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-muted-foreground py-8"
              >
                No results found for this exam.
              </TableCell>
            </TableRow>
          ) : (
            marks.map((m) => {
              const max = m.exams?.max_marks ?? 0;
              const obtained = m.marks_obtained ?? 0;
              const pct = max > 0 ? Math.round((obtained / max) * 100) : 0;
              const grade = max > 0 ? getGrade(obtained, max) : "—";
              return (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">
                    {m.subjects?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {m.subjects?.code ?? "—"}
                  </TableCell>
                  <TableCell>{m.marks_obtained ?? "—"}</TableCell>
                  <TableCell>{max}</TableCell>
                  <TableCell>{max > 0 ? `${pct}%` : "—"}</TableCell>
                  <TableCell>
                    <span className={`font-semibold ${gradeColor(grade)}`}>
                      {grade}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {m.remarks ?? "—"}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
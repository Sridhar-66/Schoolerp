"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStudentResultByExam } from "@/services/academic/results";
import { type StudentResultDetail } from "@/services/academic/results-helpers";

function GradeBadge({ grade }: { grade: string | null }) {
  if (!grade) return <span className="text-muted-foreground text-4xl font-bold">--</span>;
  const colors: Record<string, string> = {
    "A+": "text-emerald-600", A: "text-green-600", "B+": "text-blue-600",
    B: "text-sky-600", C: "text-yellow-600", D: "text-orange-600", F: "text-red-600",
  };
  return <span className={`text-5xl font-bold ${colors[grade] ?? "text-foreground"}`}>{grade}</span>;
}

function PercentRing({ pct }: { pct: number | null }) {
  const radius = 52;
  const stroke = 8;
  const circumference = 2 * Math.PI * radius;
  const value = pct ?? 0;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 75 ? "#16a34a" : value >= 50 ? "#ca8a04" : "#dc2626";
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="128" height="128" className="-rotate-90">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-muted/30" />
        <circle cx="64" cy="64" r={radius} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circumference} strokeDashoffset={pct !== null ? offset : circumference}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold" style={{ color }}>{pct !== null ? `${pct}%` : "--"}</span>
        <span className="text-xs text-muted-foreground">Score</span>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start py-3 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right max-w-[60%]">{value}</span>
    </div>
  );
}

export default function StudentResultDetailPage() {
  const params = useParams();
  const router = useRouter();
  const examId = Number(params.examId);
  const [result, setResult] = useState<StudentResultDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!examId || isNaN(examId)) { setError("Invalid exam."); setLoading(false); return; }
    const init = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setError("Not authenticated."); setLoading(false); return; }
        const { data: student, error: sErr } = await supabase
          .from("students").select("id").eq("profile_id", user.id).single();
        if (sErr || !student) { setError("Could not load student record."); setLoading(false); return; }
        const data = await getStudentResultByExam((student as { id: number }).id, examId);
        if (!data) {
          setError("Result not found for this exam.");
        } else if (!data.is_published) {
          setError("This result has not been published yet. Please check back later.");
        } else {
          setResult(data);
        }
      } catch (e: any) {
        setError(e.message ?? "Failed to load result.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [examId]);

  if (loading) return <div className="flex items-center justify-center py-24 text-muted-foreground">Loading result...</div>;

  if (error || !result) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center py-24">
        <p className="text-red-500 text-center max-w-sm">{error ?? "Result not found."}</p>
        <button onClick={() => router.push("/student/results")} className="text-sm underline text-muted-foreground hover:text-foreground">
          Back to Results
        </button>
      </div>
    );
  }

  const isPassed = result.percentage !== null && result.percentage >= 40;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <button onClick={() => router.push("/student/results")} className="self-start text-sm text-muted-foreground hover:text-foreground underline">
        Back to Results
      </button>

      <h1 className="text-2xl font-bold">{result.exam_name}</h1>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <PercentRing pct={result.percentage} />
            <div className="flex flex-col gap-3 flex-1">
              <div className="flex items-baseline gap-3">
                <GradeBadge grade={result.grade} />
                <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${result.marks_obtained === null ? "bg-muted text-muted-foreground" : isPassed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {result.marks_obtained === null ? "Pending" : isPassed ? "Passed" : "Failed"}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold tabular-nums">{result.marks_obtained !== null ? result.marks_obtained : "--"}</span>
                <span className="text-xl text-muted-foreground">/{result.max_marks}</span>
              </div>
              <p className="text-sm text-muted-foreground">Marks Obtained</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Exam Details</CardTitle></CardHeader>
        <CardContent className="px-6 pb-4">
          <DetailRow label="Subject" value={<>{result.subject_name ?? "--"}{result.subject_code && <span className="ml-1 text-xs text-muted-foreground">({result.subject_code})</span>}</>} />
          <DetailRow label="Exam Date" value={result.exam_date ? new Date(result.exam_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "--"} />
          <DetailRow label="Section" value={result.section_display_name ?? "--"} />
          <DetailRow label="Academic Year" value={result.academic_year_name ?? "--"} />
          <DetailRow label="Max Marks" value={result.max_marks} />
          <DetailRow label="Entered At" value={result.entered_at ? new Date(result.entered_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "--"} />
        </CardContent>
      </Card>

      {result.admin_remarks && (
        <Card>
          <CardHeader><CardTitle className="text-base">Principal Remarks</CardTitle></CardHeader>
          <CardContent className="px-6 pb-4">
            <p className="text-sm text-muted-foreground italic leading-relaxed">"{result.admin_remarks}"</p>
          </CardContent>
        </Card>
      )}

      {result.remarks && (
        <Card>
          <CardHeader><CardTitle className="text-base">Teacher Remarks</CardTitle></CardHeader>
          <CardContent className="px-6 pb-4">
            <p className="text-sm text-muted-foreground leading-relaxed">{result.remarks}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Grade Scale</CardTitle></CardHeader>
        <CardContent className="px-6 pb-4">
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            {[
              { grade: "A+", range: ">= 90%",  color: "bg-emerald-100 text-emerald-700" },
              { grade: "A",  range: "80-89%", color: "bg-green-100 text-green-700" },
              { grade: "B+", range: "70-79%", color: "bg-blue-100 text-blue-700" },
              { grade: "B",  range: "60-69%", color: "bg-sky-100 text-sky-700" },
              { grade: "C",  range: "50-59%", color: "bg-yellow-100 text-yellow-700" },
              { grade: "D",  range: "40-49%", color: "bg-orange-100 text-orange-700" },
              { grade: "F",  range: "< 40%",  color: "bg-red-100 text-red-700" },
            ].map(({ grade, range, color }) => (
              <div key={grade} className={`rounded-lg px-2 py-2 font-semibold ${color} ${result.grade === grade ? "ring-2 ring-offset-1 ring-current" : ""}`}>
                <div className="text-base font-bold">{grade}</div>
                <div className="text-[10px] font-normal opacity-80">{range}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
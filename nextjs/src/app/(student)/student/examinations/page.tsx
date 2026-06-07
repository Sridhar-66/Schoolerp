"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getExams, ExamRow } from "@/services/academic/exams";
import { CalendarIcon, BookOpen, Search } from "lucide-react";

function getStatus(exam_date: string | null): {
  label: string;
  className: string;
} {
  if (!exam_date) return { label: "No Date", className: "bg-muted text-muted-foreground" };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(exam_date);
  if (d < today) return { label: "Completed", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" };
  return { label: "Upcoming", className: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400" };
}

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function StudentExaminationsPage() {
  const [exams, setExams] = useState<ExamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<"all" | "upcoming" | "completed">("all");
  const [search, setSearch] = useState("");

  async function loadExams() {
    try {
      setLoading(true);
      setError(null);
      const examData = await getExams();
      setExams(examData);
    } catch (e: any) {
      setError(e.message || "Failed to fetch examination schedule.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExams();
  }, []);

  const filteredExams = exams.filter((e) => {
    const status = getStatus(e.exam_date).label.toLowerCase();
    if (statusFilter === "upcoming" && status !== "upcoming") return false;
    if (statusFilter === "completed" && status !== "completed") return false;
    
    if (
      search &&
      !e.name.toLowerCase().includes(search.toLowerCase()) &&
      !(e.subject_name ?? "").toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Examination Schedule</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          View your upcoming and completed exam timetables
        </p>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by exam or subject…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        
        <div className="flex gap-1 border rounded-md p-1 bg-background self-stretch sm:self-auto justify-center">
          {(["all", "upcoming", "completed"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-1.5 text-xs rounded font-medium capitalize transition-colors ${
                statusFilter === filter
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Global Fetch Error Alert */}
      {error && (
        <div className="rounded-md bg-destructive/10 text-destructive px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Schedule Layout */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[30%]">Exam Name</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Max Marks</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span>Loading exam schedules…</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredExams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-16 text-muted-foreground">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-muted rounded-full">
                      <CalendarIcon className="w-6 h-6 opacity-60" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-foreground">No examinations found</span>
                      <span className="text-xs">There are no matching exams scheduled at this time.</span>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredExams.map((exam) => {
                const status = getStatus(exam.exam_date);
                return (
                  <TableRow key={exam.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-semibold text-foreground">
                      {exam.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <BookOpen className="w-3.5 h-3.5 shrink-0 text-primary/70" />
                        <span className="text-foreground/90 font-medium">{exam.subject_name ?? "General"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-muted-foreground">
                      {formatDate(exam.exam_date)}
                    </TableCell>
                    <TableCell className="font-medium">
                      <span className="text-muted-foreground text-xs">Out of</span> {exam.max_marks}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide shadow-sm ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </TableCell>
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
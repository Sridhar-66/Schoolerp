"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getTimetableBySection, TimetableEntry } from "@/services/academic/timetable";
import { Loader2, CalendarDays } from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

// Subtle pastel fills per period for readability
const SLOT_COLOURS = [
  "bg-sky-50 border-sky-200 text-sky-900",
  "bg-violet-50 border-violet-200 text-violet-900",
  "bg-emerald-50 border-emerald-200 text-emerald-900",
  "bg-amber-50 border-amber-200 text-amber-900",
  "bg-rose-50 border-rose-200 text-rose-900",
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function StudentTimetablePage() {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [sectionName, setSectionName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTimetable() {
      try {
        const supabase = createClient();

        // 1. Resolve the current user
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          setError("Authentication error. Please log in again.");
          return;
        }

        // 2. Resolve student record → section
        const { data: student, error: studentError } = await (supabase as any)
          .from("students")
          .select("section_id, sections(name)")
          .eq("profile_id", user.id)
          .single();

        if (studentError || !student) {
          setError("Your student record was not found. Contact the administrator.");
          return;
        }

        if (!student.section_id) {
          setError("You have not been assigned to a section yet. Contact the administrator.");
          return;
        }

        // Capture section name for display
        if (student.sections?.name) {
          setSectionName(student.sections.name);
        }

        // 3. Fetch timetable for the student's section (server action)
        const data = await getTimetableBySection(student.section_id);
        setTimetable(data);
      } catch (err: any) {
        setError(err.message || "Failed to load timetable.");
      } finally {
        setLoading(false);
      }
    }

    loadTimetable();
  }, []);

  // Build O(1) lookup map
  const slotMap = new Map<string, TimetableEntry>();
  timetable.forEach((entry) => {
    slotMap.set(`${entry.day_of_week}-${entry.period_number}`, entry);
  });

  // ── Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
      </div>
    );
  }

  // ── Error / empty state
  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">My Timetable</h1>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 border border-dashed rounded-xl p-16 text-center">
          <CalendarDays className="h-10 w-10 text-slate-300" />
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (timetable.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">My Timetable</h1>
          {sectionName && (
            <p className="text-sm text-muted-foreground">Section: {sectionName}</p>
          )}
        </div>
        <div className="flex flex-col items-center justify-center gap-3 border border-dashed rounded-xl p-16 text-center">
          <CalendarDays className="h-10 w-10 text-slate-300" />
          <p className="text-slate-500 text-sm">
            Your timetable has not been configured yet.
          </p>
          <p className="text-slate-400 text-xs">Check back after the administrator sets it up.</p>
        </div>
      </div>
    );
  }

  // ── Full timetable grid (read-only)
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">My Timetable</h1>
        {sectionName && (
          <p className="text-sm text-muted-foreground">Section: {sectionName}</p>
        )}
      </div>

      {/* Grid */}
      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="p-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide w-20 border-r">
                Period
              </th>
              {DAYS.map((day) => (
                <th
                  key={day}
                  className="p-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide"
                >
                  {day.slice(0, 3)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERIODS.map((period) => (
              <tr key={period} className="border-b last:border-b-0">
                {/* Period label */}
                <td className="p-3 border-r bg-slate-50">
                  <span className="font-mono text-xs font-bold text-slate-500">
                    P{period}
                  </span>
                </td>

                {/* Day cells */}
                {DAYS.map((day) => {
                  const slot = slotMap.get(`${day}-${period}`);
                  const colourClass =
                    SLOT_COLOURS[(period - 1) % SLOT_COLOURS.length];

                  return (
                    <td key={day} className="p-1.5">
                      {slot ? (
                        <div
                          className={`rounded-lg border p-2 text-center min-h-[52px] flex flex-col justify-center ${colourClass}`}
                        >
                          <p className="text-xs font-semibold leading-tight line-clamp-1">
                            {slot.subjects?.name ?? "—"}
                          </p>
                          {slot.subjects?.code && (
                            <p className="text-[10px] font-mono opacity-60 mt-0.5">
                              {slot.subjects.code}
                            </p>
                          )}
                          {slot.teachers?.profiles?.full_name && (
                            <p className="text-[11px] opacity-70 mt-0.5 line-clamp-1">
                              {slot.teachers.profiles.full_name}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="rounded-lg min-h-[52px] border border-dashed border-slate-100 bg-slate-50/50" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400 text-right">
        Contact the administrator to report any timetable errors.
      </p>
    </div>
  );
}
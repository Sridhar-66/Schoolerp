"use client";

import { useEffect, useState } from "react";
// Use project alias to resolve utils supabase cutils
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TimetableItem {
  id: number;
  day_of_week: string;
  period_number: number;
  start_time: string;
  end_time: string;
  subjects: {
    name: string;
    code: string;
  } | null;
}

export default function StudentTimetablePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timetableEntries, setTimetableEntries] = useState<TimetableItem[]>([]);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  useEffect(() => {
    async function fetchTimetable() {
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

        // Query timetable entries and join subject names/codes
        const { data, error: fetchError } = await supabase
          .from("timetable")
          .select(`
            id,
            day_of_week,
            period_number,
            start_time,
            end_time,
            subjects (
              name,
              code
            )
          `)
          .eq("section_id", student.section_id);

        if (fetchError) throw fetchError;

        setTimetableEntries((data as unknown as TimetableItem[]) || []);
      } catch (err: any) {
        console.error("Timetable Fetch Error:", err);
        setError(err.message || "An unexpected error occurred while fetching your schedule.");
      } finally {
        setLoading(false);
      }
    }

    fetchTimetable();
  }, []);

  // Dynamically resolve total periods (1 to N) based on configuration data (minimum 6)
  const maxPeriod = timetableEntries.length > 0 
    ? Math.max(...timetableEntries.map(e => e.period_number), 6) 
    : 6;
  const periods = Array.from({ length: maxPeriod }, (_, i) => i + 1);

  // Lookup helper matching items to specific grid points
  const getEntry = (day: string, periodNum: number) => {
    return timetableEntries.find(
      e => e.day_of_week?.toLowerCase() === day.toLowerCase() && e.period_number === periodNum
    );
  };

  // Human-readable time converter helper
  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":");
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const displayHours = h % 12 || 12;
    return `${displayHours}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground animate-pulse font-medium">Loading your academic schedule...</div>
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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Timetable</h1>
        <p className="text-muted-foreground mt-1">View your weekly class schedule, subject periods, and times.</p>
      </div>

      <Card className="shadow-sm border">
        <CardHeader className="pb-3 border-b bg-muted/10">
          <CardTitle className="text-base font-semibold">Weekly Schedule Matrix</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-muted/30 border-b">
                  <th className="border-r p-3 font-semibold text-left text-muted-foreground w-28 bg-muted/20">
                    Period
                  </th>
                  {days.map((day) => (
                    <th key={day} className="border-r p-3 font-semibold text-center min-w-[150px] last:border-r-0">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {periods.map((p) => (
                  <tr key={p} className="hover:bg-muted/5 transition-colors">
                    {/* Y-Axis Label: Period + Standard Time Block Reference */}
                    <td className="border-r p-3 font-medium text-left bg-muted/5 align-middle w-28">
                      <div className="font-bold text-foreground">Period {p}</div>
                      {(() => {
                        const referenceItem = timetableEntries.find(e => e.period_number === p);
                        if (referenceItem?.start_time) {
                          return (
                            <div className="text-[11px] text-muted-foreground mt-0.5 whitespace-nowrap font-mono">
                              {formatTime(referenceItem.start_time)} - {formatTime(referenceItem.end_time)}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </td>

                    {/* X-Axis Data: Assigned Classes */}
                    {days.map((day) => {
                      const entry = getEntry(day, p);
                      return (
                        <td key={day} className="border-r p-3 text-center align-middle h-24 last:border-r-0">
                          {entry ? (
                            <div className="flex flex-col h-full justify-center items-center gap-1.5 p-1 rounded-md bg-primary/5 border border-primary/10">
                              <span className="font-semibold text-primary text-sm leading-snug max-w-[140px] truncate block">
                                {entry.subjects?.name}
                              </span>
                              {entry.subjects?.code && (
                                <span className="text-[10px] tracking-wider uppercase font-mono px-1.5 py-0.5 rounded bg-background border text-muted-foreground shadow-2xs">
                                  {entry.subjects.code}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground/30 font-light text-xs">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TimetableEntry {
  id: string;
  period_number: number;
  start_time: string;
  end_time: string;
  date: string;
  subject: {
    name: string;
    code: string;
  } | null;
  teacher: {
    profile: {
      full_name: string;
    } | null;
  } | null;
}

function formatTime(time: string) {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${m} ${ampm}`;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function isToday(dateStr: string) {
  return new Date(dateStr).toDateString() === new Date().toDateString();
}

export default function TimetablePage() {
  const [grouped, setGrouped] = useState<Record<string, TimetableEntry[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTimetable() {
      try {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data: student, error: studentError } = await (supabase
          .from("students") as any)
          .select("id, section_id, roll_number")
          .eq("profile_id", user.id)
          .single();

        if (studentError || !student) throw new Error("Student record not found");

        const today = new Date().toISOString().split("T")[0];

        const { data: entries, error: ttError } = await (supabase
          .from("timetable") as any)
          .select(
            `id, period_number, start_time, end_time, date,
             subject:subjects!timetable_subject_id_fkey(name, code),
             teacher:teachers!timetable_teacher_id_fkey(
               profile:profiles!teachers_profile_id_fkey(full_name)
             )`
          )
          .eq("section_id", student.section_id)
          .gte("date", today)
          .order("date", { ascending: true })
          .order("period_number", { ascending: true });

        if (ttError) throw new Error(ttError.message);

        const map: Record<string, TimetableEntry[]> = {};
        for (const entry of entries ?? []) {
          const d = entry.date;
          if (!map[d]) map[d] = [];
          map[d].push(entry as unknown as TimetableEntry);
        }

        setGrouped(map);
      } catch (err: any) {
        setError(err.message ?? "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchTimetable();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">Loading timetable...</div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const dates = Object.keys(grouped).sort();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Timetable</h1>

      {dates.length === 0 ? (
        <Alert>
          <AlertDescription>No upcoming classes scheduled.</AlertDescription>
        </Alert>
      ) : (
        dates.map((date) => {
          const entries = grouped[date];
          const todayBadge = isToday(date);

          return (
            <Card key={date}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  {formatDate(date)}
                  {todayBadge && (
                    <span className="text-xs font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      Today
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {entries.length === 0 ? (
                  <Alert>
                    <AlertDescription>No classes scheduled for this day.</AlertDescription>
                  </Alert>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-muted-foreground text-left">
                          <th className="py-2 pr-4 font-medium">Period</th>
                          <th className="py-2 pr-4 font-medium">Time</th>
                          <th className="py-2 pr-4 font-medium">Subject</th>
                          <th className="py-2 font-medium">Teacher</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entries.map((entry) => (
                          <tr key={entry.id} className="border-b last:border-0">
                            <td className="py-2 pr-4">{entry.period_number}</td>
                            <td className="py-2 pr-4 whitespace-nowrap">
                              {formatTime(entry.start_time)} – {formatTime(entry.end_time)}
                            </td>
                            <td className="py-2 pr-4">
                              {entry.subject ? (
                                <>
                                  <span className="font-medium">{entry.subject.name}</span>
                                  <span className="text-muted-foreground ml-1 text-xs">
                                    ({entry.subject.code})
                                  </span>
                                </>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="py-2">
                              {entry.teacher?.profile?.full_name ?? (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
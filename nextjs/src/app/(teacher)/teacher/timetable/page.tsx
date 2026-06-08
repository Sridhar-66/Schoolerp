"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface TimetableEntry {
  id: number;
  period_number: number;
  start_time: string;
  end_time: string;
  date: string | null;
  academic_year_id: number;
  subjects: {
    name: string;
    code: string;
  } | null;
  sections: {
    name: string;
  } | null;
}

export default function TeacherTimetablePage() {
  const [schedule, setSchedule] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });

  // Fetch data safely without passing sensitive user parameters from the client side
  useEffect(() => {
    async function fetchTimetable() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/teacher/timetable?date=${selectedDate}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load timetable data components.");
        }

        setSchedule(data);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred while loading your schedule.");
      } finally {
        setLoading(false);
      }
    }

    fetchTimetable();
  }, [selectedDate]);

  const formatTimeStr = (timeString: string) => {
    if (!timeString) return "";
    const parts = timeString.split(":");
    if (parts.length < 2) return timeString;
    const hour = parseInt(parts[0], 10);
    const min = parts[1];
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${String(displayHour).padStart(2, "0")}:${min} ${ampm}`;
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Class Timetable</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View your daily class routines, assigned subjects, and session timings securely.
          </p>
        </div>
        
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label htmlFor="schedule-date" className="text-sm font-medium text-slate-700 whitespace-nowrap">
            Filter Date:
          </label>
          <Input
            id="schedule-date"
            type="date"
            className="w-44 bg-white"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Profile or Configuration Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="w-full h-48 flex items-center justify-center">
          <div className="text-sm text-muted-foreground animate-pulse">
            Securely verifying session and downloading data schedule...
          </div>
        </div>
      ) : (
        <Card className="shadow-sm">
          <CardHeader className="bg-slate-50/50">
            <CardTitle className="text-base font-semibold">
              Daily Roster — {new Date(selectedDate).toLocaleDateString(undefined, { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardTitle>
            <CardDescription>
              Chronological listing of your allocated teaching slots.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
                  <TableHead className="w-[100px] font-semibold text-slate-700">Period</TableHead>
                  <TableHead className="w-[220px] font-semibold text-slate-700">Timing</TableHead>
                  <TableHead className="font-semibold text-slate-700">Subject Details</TableHead>
                  <TableHead className="font-semibold text-slate-700">Assigned Section</TableHead>
                  <TableHead className="w-[120px] text-right font-semibold text-slate-700">Academic Year ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedule.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No classes scheduled for this date.
                    </TableCell>
                  </TableRow>
                ) : (
                  schedule.map((entry) => (
                    <TableRow key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-medium text-slate-900">
                        Slot {entry.period_number}
                      </TableCell>
                      <TableCell className="text-slate-600 font-mono text-xs">
                        {formatTimeStr(entry.start_time)} – {formatTimeStr(entry.end_time)}
                      </TableCell>
                      <TableCell>
                        {entry.subjects ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-800">{entry.subjects.name}</span>
                            <span className="text-xs text-muted-foreground font-mono">{entry.subjects.code}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic text-xs">Unspecified Subject</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {entry.sections ? (
                          <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                            Section {entry.sections.name}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic text-xs">Unspecified Section</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-slate-500 text-sm font-mono">
                        {entry.academic_year_id}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
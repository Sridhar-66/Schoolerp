"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AttendanceRecord = {
  id: number;
  date: string;
  status: string;
  remarks: string | null;
  timetable: {
    day_of_week: string;
    period_number: number;
    subjects: { name: string } | null;
  } | null;
};

type MonthlySummary = {
  present: number;
  absent: number;
  total: number;
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const sel =
  "h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

export default function StudentAttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      const supabase = createClient();

      // Get logged-in user → student id
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

   const { data: studentRaw } = await supabase
  .from("students")
  .select("id")
  .eq("profile_id", user.id)
  .single();

const student = studentRaw as { id: number } | null;
if (!student) return;

      // Build date range for selected month
      const from = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-01`;
      const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      const to = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${lastDay}`;

      const { data } = await supabase
        .from("attendance")
        .select(`
          id,
          date,
          status,
          remarks,
          timetable (
            day_of_week,
            period_number,
            subjects ( name )
          )
        `)
        .eq("student_id", student.id)
        .gte("date", from)
        .lte("date", to)
        .order("date", { ascending: false });

      if (data) setRecords(data as unknown as AttendanceRecord[]);
      setLoading(false);
    };

    fetchAttendance();
  }, [selectedMonth, selectedYear]);

  const summary: MonthlySummary = records.reduce(
    (acc, r) => {
      acc.total += 1;
      if (r.status === "present") acc.present += 1;
      else if (r.status === "absent") acc.absent += 1;
      return acc;
    },
    { present: 0, absent: 0, total: 0 }
  );

  const attendancePercent =
    summary.total > 0
      ? Math.round((summary.present / summary.total) * 100)
      : null;

  // Build year options: current year and 2 years back
  const years = [selectedYear - 2, selectedYear - 1, selectedYear];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">My Attendance</h1>

      {/* Month / Year filter */}
      <div className="flex gap-3">
        <select
          className={sel}
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
        >
          {MONTHS.map((m, i) => (
            <option key={m} value={i}>
              {m}
            </option>
          ))}
        </select>
        <select
          className={sel}
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Monthly Summary */}
      <Card>
        <CardHeader>
          <CardTitle>
            {MONTHS[selectedMonth]} {selectedYear} — Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-8">
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground">Present</p>
                <p className="text-2xl font-bold text-green-600">
                  {summary.present}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground">Absent</p>
                <p className="text-2xl font-bold text-red-500">
                  {summary.absent}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{summary.total}</p>
              </div>
              {attendancePercent !== null && (
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-muted-foreground">Percentage</p>
                  <p
                    className={`text-2xl font-bold ${
                      attendancePercent < 75
                        ? "text-red-500"
                        : "text-green-600"
                    }`}
                  >
                    {attendancePercent}%
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Period</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Remarks</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground py-8"
              >
                Loading...
              </TableCell>
            </TableRow>
          ) : records.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground py-8"
              >
                No attendance records for this month.
              </TableCell>
            </TableRow>
          ) : (
            records.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  {new Date(r.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell>
                  {r.timetable?.subjects?.name ?? "—"}
                </TableCell>
                <TableCell>
                  {r.timetable?.period_number ?? "—"}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                      r.status === "present"
                        ? "bg-green-100 text-green-700"
                        : r.status === "absent"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {r.status}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {r.remarks ?? "—"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
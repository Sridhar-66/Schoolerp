"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getSections,
  getTimetableSlots,
  getStudentsWithAttendance,
  saveAttendance,
  SectionOption,
  TimetableSlot,
  StudentAttendanceRow,
} from "@/services/academic/attendance";

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function sectionLabel(s: SectionOption) {
  return `${s.class_name} – ${s.name}`;
}

function slotLabel(t: TimetableSlot) {
  const time = t.start_time && t.end_time ? ` (${t.start_time} – ${t.end_time})` : "";
  const subject = t.subject_name ? ` · ${t.subject_name}` : "";
  return `Period ${t.period_number}${subject}${time}`;
}

export default function AttendancePage() {
  const [sections, setSections] = useState<SectionOption[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());

  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");

  const [rows, setRows] = useState<StudentAttendanceRow[]>([]);
  const [statusMap, setStatusMap] = useState<Record<number, "present" | "absent">>({});

  const [loadingSections, setLoadingSections] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load sections once on mount
  useEffect(() => {
    getSections()
      .then(setSections)
      .catch((e) => console.error("Error fetching sections:", e))
      .finally(() => setLoadingSections(false));
  }, []);

  // Load timetable slots when section or date changes
  useEffect(() => {
    setSlots([]);
    setSelectedSlot("");
    setRows([]);
    setStatusMap({});

    if (!selectedSection || !selectedDate) return;

    setLoadingSlots(true);
    getTimetableSlots(Number(selectedSection), selectedDate)
      .then(setSlots)
      .catch((e) => console.error("Error fetching timetable slots:", e))
      .finally(() => setLoadingSlots(false));
  }, [selectedSection, selectedDate]);

  // Load students when a specific period/slot is selected
  useEffect(() => {
    setRows([]);
    setStatusMap({});
    setSaveError("");
    setSaveSuccess(false);

    if (!selectedSection || !selectedSlot || !selectedDate) return;

    setLoadingStudents(true);
    getStudentsWithAttendance(
      Number(selectedSection),
      Number(selectedSlot),
      selectedDate
    )
      .then((data) => {
        setRows(data);
        const map: Record<number, "present" | "absent"> = {};
        for (const r of data) {
          map[r.student_id] = r.status ?? "present"; // Default to present if unrecorded
        }
        setStatusMap(map);
      })
      .catch((e) => console.error("Error fetching student checklist:", e))
      .finally(() => setLoadingStudents(false));
  }, [selectedSection, selectedSlot, selectedDate]);

  function toggle(studentId: number) {
    setStatusMap((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === "present" ? "absent" : "present",
    }));
    setSaveSuccess(false);
  }

  function markAll(status: "present" | "absent") {
    const map: Record<number, "present" | "absent"> = {};
    for (const r of rows) map[r.student_id] = status;
    setStatusMap(map);
    setSaveSuccess(false);
  }

  function handleSave() {
    setSaveError("");
    setSaveSuccess(false);

    const records = rows.map((r) => ({
      student_id: r.student_id,
      status: statusMap[r.student_id] ?? "present",
    }));

    startTransition(async () => {
      try {
        await saveAttendance({
          section_id: Number(selectedSection),
          timetable_id: Number(selectedSlot),
          date: selectedDate,
          records,
        });
        setSaveSuccess(true);
      } catch (e: any) {
        setSaveError(e.message ?? "Failed to update attendance matrix.");
      }
    });
  }

  const presentCount = Object.values(statusMap).filter((s) => s === "present").length;
  const absentCount = Object.values(statusMap).filter((s) => s === "absent").length;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      {/* Header Context */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Period Attendance</h1>
          <p className="text-sm text-muted-foreground">Log or edit attendance entries by scheduled slots.</p>
        </div>
        {rows.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-green-50 dark:bg-green-950/40 px-2.5 py-1 text-xs font-semibold text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-600/20">
              {presentCount} Present
            </span>
            <span className="inline-flex items-center rounded-md bg-red-50 dark:bg-red-950/40 px-2.5 py-1 text-xs font-semibold text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-600/20">
              {absentCount} Absent
            </span>
          </div>
        )}
      </div>

      {/* Filter Parameters Layout */}
      <div className="flex flex-wrap gap-4 items-end bg-muted/30 p-4 rounded-lg border">
        {/* Section Picker */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Section</label>
          <Select
            value={selectedSection}
            onValueChange={(val) => { setSelectedSection(val); setSelectedSlot(""); }}
            disabled={loadingSections}
          >
            <SelectTrigger className="w-56 bg-background">
              <SelectValue placeholder={loadingSections ? "Loading rosters..." : "Select active section"} />
            </SelectTrigger>
            <SelectContent>
              {sections.length === 0 ? (
                <SelectItem value="none" disabled>No assignments found</SelectItem>
              ) : (
                sections.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {sectionLabel(s)}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Date Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Date</label>
          <Input
            type="date"
            className="w-44 bg-background"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {/* Timetable Period Selection */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Target Period</label>
          <Select
            value={selectedSlot}
            onValueChange={setSelectedSlot}
            disabled={!selectedSection || loadingSlots}
          >
            <SelectTrigger className="w-72 bg-background">
              <SelectValue
                placeholder={
                  !selectedSection
                    ? "Choose a section first"
                    : loadingSlots
                    ? "Loading schedule..."
                    : slots.length === 0
                    ? "No slots matching date"
                    : "Select active period"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {slots.map((t) => (
                <SelectItem key={t.id} value={String(t.id)}>
                  {slotLabel(t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Control Actions Row */}
      {rows.length > 0 && (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => markAll("present")} disabled={isPending}>
            Mark All Present
          </Button>
          <Button variant="outline" size="sm" onClick={() => markAll("absent")} disabled={isPending}>
            Mark All Absent
          </Button>
          <div className="flex-1" />
          <Button onClick={handleSave} disabled={isPending} className="px-5">
            {isPending ? "Committing updates..." : "Save Attendance"}
          </Button>
        </div>
      )}

      {/* Feedback Alerts */}
      {saveSuccess && (
        <div className="text-sm font-medium text-green-800 bg-green-50 dark:bg-green-950/30 dark:text-green-400 p-3 rounded-md border border-green-200 dark:border-green-900">
          ✓ Roster baseline committed successfully to database.
        </div>
      )}
      {saveError && (
        <div className="text-sm font-medium text-red-800 bg-red-50 dark:bg-red-950/30 dark:text-red-400 p-3 rounded-md border border-red-200 dark:border-red-900">
          ⚠ Operation failure: {saveError}
        </div>
      )}

      {/* Roll List Matrix View */}
      <div className="border rounded-md bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32 pl-4">Roll ID</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead className="w-44 text-right pr-4">Status Selector</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!selectedSection || !selectedDate || !selectedSlot ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground h-32">
                  Complete filters to populate target structural class roster.
                </TableCell>
              </TableRow>
            ) : loadingStudents ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground h-32">
                  Compiling operational student registry data...
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground h-32">
                  No registered active student entities found in this sub-section.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const status = statusMap[row.student_id] ?? "present";
                const isPresent = status === "present";
                return (
                  <TableRow key={row.student_id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-sm pl-4 text-muted-foreground">
                      {row.roll_number ?? "—"}
                    </TableCell>
                    <TableCell className="font-medium">{row.full_name}</TableCell>
                    <TableCell className="text-right pr-4">
                      <button
                        onClick={() => toggle(row.student_id)}
                        disabled={isPending}
                        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ring-1 ring-inset transition-all select-none cursor-pointer
                          ${isPresent
                            ? "bg-green-50 text-green-700 ring-green-600/20 hover:bg-green-100"
                            : "bg-red-50 text-red-700 ring-red-600/20 hover:bg-red-100"
                          }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${isPresent ? "bg-green-600" : "bg-red-600"}`} />
                        {isPresent ? "Present" : "Absent"}
                      </button>
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
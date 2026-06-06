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
  const time =
    t.start_time && t.end_time ? ` (${t.start_time} – ${t.end_time})` : "";
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

  // Load sections once
  useEffect(() => {
    getSections()
      .then(setSections)
      .catch((e) => console.error(e))
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
      .catch((e) => console.error(e))
      .finally(() => setLoadingSlots(false));
  }, [selectedSection, selectedDate]);

  // Load students when slot is selected
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
          map[r.student_id] = r.status ?? "present";
        }
        setStatusMap(map);
      })
      .catch((e) => console.error(e))
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
        setSaveError(e.message ?? "Failed to save attendance.");
      }
    });
  }

  const presentCount = Object.values(statusMap).filter((s) => s === "present").length;
  const absentCount = Object.values(statusMap).filter((s) => s === "absent").length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Attendance</h1>
        {rows.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-700/10">
              {presentCount} Present
            </span>
            <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-700/10">
              {absentCount} Absent
            </span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        {/* Section */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Section</label>
          <Select
            value={selectedSection}
            onValueChange={(val) => { setSelectedSection(val); setSelectedSlot(""); }}
            disabled={loadingSections}
          >
            <SelectTrigger className="w-52">
              <SelectValue placeholder={loadingSections ? "Loading..." : "Select section"} />
            </SelectTrigger>
            <SelectContent>
              {sections.length === 0 ? (
                <SelectItem value="none" disabled>No sections found</SelectItem>
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

        {/* Date */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Date</label>
          <Input
            type="date"
            className="w-44"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {/* Period / Timetable slot */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Period</label>
          <Select
            value={selectedSlot}
            onValueChange={setSelectedSlot}
            disabled={!selectedSection || loadingSlots}
          >
            <SelectTrigger className="w-64">
              <SelectValue
                placeholder={
                  !selectedSection
                    ? "Select section first"
                    : loadingSlots
                    ? "Loading..."
                    : slots.length === 0
                    ? "No periods for this day"
                    : "Select period"
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

      {/* Bulk actions + Save */}
      {rows.length > 0 && (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => markAll("present")} disabled={isPending}>
            Mark All Present
          </Button>
          <Button variant="outline" size="sm" onClick={() => markAll("absent")} disabled={isPending}>
            Mark All Absent
          </Button>
          <div className="flex-1" />
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save Attendance"}
          </Button>
        </div>
      )}

      {/* Feedback */}
      {saveSuccess && (
        <div className="text-xs text-green-700 bg-green-50 p-2 rounded border border-green-200">
          Attendance saved successfully.
        </div>
      )}
      {saveError && (
        <div className="text-xs text-red-700 bg-red-50 p-2 rounded border border-red-200">
          {saveError}
        </div>
      )}

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24">Roll No</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="w-40">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!selectedSection || !selectedDate || !selectedSlot ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                Select a section, date and period to view students.
              </TableCell>
            </TableRow>
          ) : loadingStudents ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                Loading students...
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                No students enrolled in this section.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => {
              const status = statusMap[row.student_id] ?? "present";
              const isPresent = status === "present";
              return (
                <TableRow key={row.student_id}>
                  <TableCell className="font-mono text-sm">{row.roll_number ?? "—"}</TableCell>
                  <TableCell>{row.full_name}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => toggle(row.student_id)}
                      disabled={isPending}
                      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium ring-1 ring-inset transition-colors cursor-pointer
                        ${isPresent
                          ? "bg-green-50 text-green-700 ring-green-700/10 hover:bg-green-100"
                          : "bg-red-50 text-red-700 ring-red-700/10 hover:bg-red-100"
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
  );
}
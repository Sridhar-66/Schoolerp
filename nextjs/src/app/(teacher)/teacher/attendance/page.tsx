"use client";

import { useState, useEffect, useTransition } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Loader2, Save } from "lucide-react";

// Import your newly fixed server actions
import {
  getSections,
  getTimetableSlots,
  getStudentsWithAttendance,
  saveAttendance,
  SectionOption,
  TimetableSlot,
  StudentAttendanceRow,
} from "@/services/academic/attendance"; // Ensure this matches your path!

export default function TeacherAttendancePage() {
  // Core Selection States
  const [sections, setSections] = useState<SectionOption[]>([]);
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [students, setStudents] = useState<StudentAttendanceRow[]>([]);

  // Selected Filter Values
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("2026-06-08"); // Matching your data entry date
  const [selectedSlot, setSelectedSlot] = useState<string>("");

  // Loading States via React Transitions
  const [isPending, startTransition] = useTransition();
  const [isSaving, startSaveTransition] = useTransition();

  // 1. Fetch all available sections on mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        const sectionsData = await getSections();
        setSections(sectionsData);
      } catch (err) {
        console.error("Failed to fetch sections:", err);
      }
    }
    loadInitialData();
  }, []);

  // 2. Fetch timetable periods whenever Section or Date changes
  useEffect(() => {
    if (!selectedSection || !selectedDate) {
      setSlots([]);
      setSelectedSlot("");
      setStudents([]);
      return;
    }

    startTransition(async () => {
      try {
        const slotsData = await getTimetableSlots(Number(selectedSection), selectedDate);
        setSlots(slotsData);
        setSelectedSlot(""); // Clear previously chosen period
        setStudents([]);     // Clear stale student lists
      } catch (err) {
        console.error("Failed to fetch slots:", err);
      }
    });
  }, [selectedSection, selectedDate]);

  // 3. Fetch students when a specific period/slot is selected
  useEffect(() => {
    if (!selectedSection || !selectedDate || !selectedSlot) {
      setStudents([]);
      return;
    }

    startTransition(async () => {
      try {
        const roster = await getStudentsWithAttendance(
          Number(selectedSection),
          Number(selectedSlot),
          selectedDate
        );
        setStudents(roster);
      } catch (err) {
        console.error("Failed to fetch students roster:", err);
      }
    });
  }, [selectedSlot, selectedSection, selectedDate]);

  // 4. Update the local UI state when a teacher marks Present/Absent
  const handleStatusChange = (studentId: number, status: "present" | "absent") => {
    setStudents((prev) =>
      prev.map((student) =>
        student.student_id === studentId ? { ...student, status } : student
      )
    );
  };

  // 5. Submit attendance records array back to Supabase
  const handleSave = () => {
    if (!selectedSection || !selectedSlot || !selectedDate || students.length === 0) return;

    const payload = {
      section_id: Number(selectedSection),
      timetable_id: Number(selectedSlot),
      date: selectedDate,
      records: students
        .filter((s) => s.status !== null)
        .map((s) => ({
          student_id: s.student_id,
          status: s.status!,
        })),
    };

    startSaveTransition(async () => {
      try {
        await saveAttendance(payload);
        alert("🎉 Attendance saved successfully!");
      } catch (err) {
        console.error("Failed saving attendance data:", err);
        alert("Error saving records. Check console log details.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Student Attendance Matrix</h1>
          <p className="text-muted-foreground text-sm">Select controls below to log periods.</p>
        </div>
        {students.length > 0 && (
          <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Attendance Records
          </Button>
        )}
      </div>

      {/* Control Panel Filters */}
      <Card>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          {/* Date Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Log Date</label>
            <Input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)} 
            />
          </div>

          {/* Section Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Class & Section</label>
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger>
                <SelectValue placeholder="Select class section" />
              </SelectTrigger>
              <SelectContent>
                {sections.map((sec) => (
                  <SelectItem key={sec.id} value={sec.id.toString()}>
                    {sec.class_name} - {sec.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Period Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assigned Period</label>
            <Select 
              value={selectedSlot} 
              onValueChange={setSelectedSlot}
              disabled={!selectedSection || slots.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={slots.length === 0 ? "No periods found today" : "Choose active period"} />
              </SelectTrigger>
              <SelectContent>
                {slots.map((slot) => (
                  <SelectItem key={slot.id} value={slot.id.toString()}>
                    Period {slot.period_number} ({slot.subject_name}) [{slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}]
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Roster Display */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Class Roster Grid</CardTitle>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <div className="flex flex-col justify-center items-center py-12 gap-2 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm">Fetching structural records from engine...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg bg-muted/20">
              {!selectedSection ? "Please pick a class section above to get started." : !selectedSlot ? "Pick an active timetable period to fetch students row." : "No matching student profiles found."}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[120px]">Roll No</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead className="w-[240px] text-center">Status Assignment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.student_id}>
                      <TableCell className="font-mono font-medium">{student.roll_number ?? "—"}</TableCell>
                      <TableCell className="font-medium">{student.full_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant={student.status === "present" ? "default" : "outline"}
                            className={student.status === "present" ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                            onClick={() => handleStatusChange(student.student_id, "present")}
                          >
                            <Check className="h-4 w-4 mr-1" /> Present
                          </Button>
                          <Button
                            size="sm"
                            variant={student.status === "absent" ? "destructive" : "outline"}
                            onClick={() => handleStatusChange(student.student_id, "absent")}
                          >
                            <X className="h-4 w-4 mr-1" /> Absent
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
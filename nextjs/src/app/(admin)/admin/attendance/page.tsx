"use client";

import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  getClasses, 
  getTimetableSlots, 
  getAttendanceRoster, 
  saveAttendanceRoster, 
  ClassItem, 
  TimetableSlot, 
  RosterStudent 
} from "../../../../services/attendance/attendance";

export default function AttendancePage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [roster, setRoster] = useState<RosterStudent[]>([]);

  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    getClasses()
      .then((data: ClassItem[]) => setClasses(data))
      .catch((err: any) => setMsg({ text: err.message || "Failed to load classes", type: "error" }));
  }, []);

  useEffect(() => {
    if (!selectedClass || !selectedDate) {
      setSlots([]);
      setSelectedSlot("");
      return;
    }

    const parsedDate = new Date(selectedDate);
    const dayOfWeek = parsedDate.toLocaleDateString("en-US", { weekday: "long" });

    getTimetableSlots(Number(selectedClass), dayOfWeek)
      .then((data: TimetableSlot[]) => {
        setSlots(data);
        setSelectedSlot(data.length > 0 ? String(data[0].id) : "none");
      })
      .catch((err: any) => setMsg({ text: err.message || "Failed to load slots", type: "error" }));
  }, [selectedClass, selectedDate]);

  useEffect(() => {
    if (!selectedClass || !selectedSlot || selectedSlot === "none") {
      setRoster([]);
      return;
    }

    setLoading(true);
    setMsg(null);
    getAttendanceRoster(Number(selectedClass), Number(selectedSlot), selectedDate)
      .then((data: RosterStudent[]) => setRoster(data))
      .catch((err: any) => setMsg({ text: err.message || "Failed to load roster", type: "error" }))
      .finally(() => setLoading(false));
  }, [selectedClass, selectedSlot, selectedDate]);

  const updateStatus = (studentId: number, nextStatus: string) => {
    setRoster((prev) =>
      prev.map((s) => (s.student_id === studentId ? { ...s, status: nextStatus } : s))
    );
  };

  const markAllStatus = (targetStatus: string) => {
    setRoster((prev) => prev.map((s) => ({ ...s, status: targetStatus })));
  };

  const handleSave = async () => {
    if (!selectedSlot || selectedSlot === "none") return;
    try {
      setSaving(true);
      setMsg(null);
      
      const payload = roster.map((s) => ({
        student_id: s.student_id,
        timetable_id: Number(selectedSlot),
        date: selectedDate,
        status: s.status,
      }));

      await saveAttendanceRoster(payload);
      setMsg({ text: "Attendance records synchronized successfully.", type: "success" });
    } catch (err: any) {
      setMsg({ text: err.message || "Failed saving changes.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Timetable Attendance Control</h1>
        <p className="text-sm text-muted-foreground">
          Select class parameters to track and commit student roll session logs.
        </p>
      </div>

      {msg && (
        <div className={`p-3 text-xs rounded-md border ${
          msg.type === "error" ? "bg-red-50 text-red-600 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
        }`}>
          {msg.text}
        </div>
      )}

      <div className="flex flex-wrap gap-4 items-center bg-slate-50 border p-4 rounded-lg">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600">Target Grade Class</label>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-48 bg-white shadow-sm">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600">Calendar Tracking Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-48 h-10 px-3 py-2 border rounded-md text-sm bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600">Active Schedule Period</label>
          <Select value={selectedSlot} onValueChange={setSelectedSlot} disabled={slots.length === 0}>
            <SelectTrigger className="w-64 bg-white shadow-sm disabled:bg-slate-100">
              <SelectValue placeholder={slots.length === 0 ? "No periods found this day" : "Choose active subject period"} />
            </SelectTrigger>
            <SelectContent>
              {slots.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.subject_name} ({s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {roster.length > 0 && (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => markAllStatus("Present")} className="text-xs">
            Mark All Present
          </Button>
          <Button variant="outline" size="sm" onClick={() => markAllStatus("Absent")} className="text-xs text-red-600 hover:text-red-700">
            Mark All Absent
          </Button>
        </div>
      )}

      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/70">
            <TableRow>
              <TableHead className="w-24">Roll No</TableHead>
              <TableHead>Student Full Name</TableHead>
              <TableHead className="text-right w-96">Attendance Tracking Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-12 text-muted-foreground animate-pulse">
                  Assembling real-time class roster profiles...
                </TableCell>
              </TableRow>
            ) : !selectedClass ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground text-sm">
                  Please select a class grade above to load tracking data.
                </TableCell>
              </TableRow>
            ) : slots.length === 0 || selectedSlot === "none" ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-amber-600 bg-amber-50/40 font-medium text-sm">
                  No active timetable sessions exist in the database schedule for this specific day.
                </TableCell>
              </TableRow>
            ) : roster.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground text-sm">
                  No active students mapped inside this selected class division.
                </TableCell>
              </TableRow>
            ) : (
              roster.map((student) => (
                <TableRow key={student.student_id} className="hover:bg-slate-50/40 transition-colors">
                  <TableCell className="font-mono text-slate-500 font-medium">{student.roll_no}</TableCell>
                  <TableCell className="font-semibold text-slate-900">{student.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1 border p-1 rounded-md bg-slate-50 shadow-inner">
                      {["Present", "Absent", "Late", "Excused"].map((statusOption) => {
                        const isSelected = student.status === statusOption;
                        let colorStyle = "text-slate-600 hover:bg-white";
                        
                        if (isSelected) {
                          if (statusOption === "Present") colorStyle = "bg-emerald-600 text-white font-medium shadow-sm hover:bg-emerald-600";
                          if (statusOption === "Absent") colorStyle = "bg-rose-600 text-white font-medium shadow-sm hover:bg-rose-600";
                          if (statusOption === "Late") colorStyle = "bg-amber-500 text-white font-medium shadow-sm hover:bg-amber-500";
                          if (statusOption === "Excused") colorStyle = "bg-sky-600 text-white font-medium shadow-sm hover:bg-sky-600";
                        }

                        return (
                          <Button
                            key={statusOption}
                            size="sm"
                            variant="ghost"
                            onClick={() => updateStatus(student.student_id, statusOption)}
                            className={`text-xs px-2.5 h-7 transition-all ${colorStyle}`}
                          >
                            {statusOption}
                          </Button>
                        );
                      })}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {roster.length > 0 && !loading && (
        <div className="flex justify-end pt-2 border-t">
          <Button onClick={handleSave} disabled={saving} className="px-6 font-medium shadow-md">
            {saving ? "Saving Changes..." : "Save Attendance"}
          </Button>
        </div>
      )}
    </div>
  );
}
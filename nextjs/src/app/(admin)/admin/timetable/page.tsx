"use client";

import { useEffect, useState } from "react";
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
import { createClient } from "@/lib/supabase/client";

type Class = { id: number; name: string };
type Section = { id: number; name: string; class_id: number };
type Subject = { id: number; name: string };
type Teacher = { id: number; full_name: string };
type AcademicYear = { id: number; name: string; is_current: boolean };
type TimetableSlot = {
  id: number;
  period_number: number;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  subject_id: number | null;
  teacher_id: number | null;
};

const TIMES = [
  "06:00","06:30","07:00","07:30","08:00","08:30",
  "09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","12:30","13:00","13:30","14:00","14:30",
  "15:00","15:30","16:00","16:30","17:00","17:30","18:00",
];

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

const EMPTY_FORM = {
  date: todayISO(),
  period_number: "",
  start_time: "",
  end_time: "",
  subject_id: "",
  teacher_id: "",
};

export default function TimetablePage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [slots, setSlots] = useState<TimetableSlot[]>([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [filteredSections, setFilteredSections] = useState<Section[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Load base data
  useEffect(() => {
    const supabase = createClient() as any;
    Promise.all([
      supabase.from("classes").select("id, name").order("name"),
      supabase.from("sections").select("id, name, class_id").order("name"),
      supabase.from("subjects").select("id, name").order("name"),
      supabase.from("academic_years").select("id, name, is_current").order("name"),
      supabase.from("teachers").select("id, profiles(full_name)").order("id"),
    ]).then(([cls, secs, subs, years, tchs]: any[]) => {
      if (cls.data) setClasses(cls.data);
      if (secs.data) setSections(secs.data);
      if (subs.data) setSubjects(subs.data);
      if (years.data) {
        setAcademicYears(years.data);
        const current = years.data.find((y: any) => y.is_current);
        if (current) setSelectedYear(String(current.id));
      }
      if (tchs.data) {
        setTeachers(
          tchs.data.map((t: any) => ({
            id: t.id,
            full_name: t.profiles?.full_name ?? `Teacher ${t.id}`,
          }))
        );
      }
    });
  }, []);

  // Filter sections by class
  useEffect(() => {
    setSelectedSection("");
    setSlots([]);
    if (selectedClass) {
      setFilteredSections(sections.filter((s) => s.class_id === Number(selectedClass)));
    } else {
      setFilteredSections([]);
    }
  }, [selectedClass, sections]);

  // Load slots when section changes
  useEffect(() => {
    setSlots([]);
    if (!selectedSection || !selectedYear) return;
    setLoading(true);
    const supabase = createClient() as any;
    supabase
      .from("timetable")
      .select("id, period_number, date, start_time, end_time, subject_id, teacher_id")
      .eq("section_id", Number(selectedSection))
      .eq("academic_year_id", Number(selectedYear))
      .order("date", { ascending: true })
      .order("period_number", { ascending: true })
      .then(({ data, error }: { data: any; error: any }) => {
        if (error) console.error(error);
        if (data) setSlots(data as TimetableSlot[]);
      })
      .finally(() => setLoading(false));
  }, [selectedSection, selectedYear]);

  function setF(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function openAdd() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
    setError("");
    setSuccess("");
  }

  function openEdit(slot: TimetableSlot) {
    setForm({
      date: slot.date ?? todayISO(),
      period_number: String(slot.period_number),
      start_time: slot.start_time ?? "",
      end_time: slot.end_time ?? "",
      subject_id: slot.subject_id ? String(slot.subject_id) : "",
      teacher_id: slot.teacher_id ? String(slot.teacher_id) : "",
    });
    setEditingId(slot.id);
    setShowForm(true);
    setError("");
    setSuccess("");
  }

  async function refreshSlots(supabase: any) {
    const { data } = await supabase
      .from("timetable")
      .select("id, period_number, date, start_time, end_time, subject_id, teacher_id")
      .eq("section_id", Number(selectedSection))
      .eq("academic_year_id", Number(selectedYear))
      .order("date", { ascending: true })
      .order("period_number", { ascending: true });
    if (data) setSlots(data as TimetableSlot[]);
  }

  async function handleSave() {
    if (!form.date || !form.period_number) {
      setError("Date and period number are required.");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");

    const supabase = createClient() as any;
    const row = {
      section_id: Number(selectedSection),
      academic_year_id: Number(selectedYear),
      date: form.date,
      period_number: Number(form.period_number),
      start_time: form.start_time || null,
      end_time: form.end_time || null,
      subject_id: form.subject_id ? Number(form.subject_id) : null,
      teacher_id: form.teacher_id ? Number(form.teacher_id) : null,
    };

    let err;
    if (editingId) {
      ({ error: err } = await supabase.from("timetable").update(row).eq("id", editingId));
    } else {
      ({ error: err } = await supabase.from("timetable").insert(row));
    }

    if (err) {
      setError(err.message);
    } else {
      setSuccess(editingId ? "Period updated." : "Period added.");
      setShowForm(false);
      setEditingId(null);
      await refreshSlots(supabase);
    }
    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this period?")) return;
    const supabase = createClient() as any;
    const { error: err } = await supabase.from("timetable").delete().eq("id", id);
    if (err) {
      setError(err.message);
    } else {
      setSlots((prev) => prev.filter((s) => s.id !== id));
      setSuccess("Period deleted.");
    }
  }

  function subjectName(id: number | null) {
    return subjects.find((s) => s.id === id)?.name ?? "—";
  }

  function teacherName(id: number | null) {
    return teachers.find((t) => t.id === id)?.full_name ?? "—";
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Timetable</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Academic Year</label>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {academicYears.map((y) => (
                <SelectItem key={y.id} value={String(y.id)}>{y.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Class</label>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Section</label>
          <Select
            value={selectedSection}
            onValueChange={setSelectedSection}
            disabled={!selectedClass}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder={selectedClass ? "Select section" : "Select class first"} />
            </SelectTrigger>
            <SelectContent>
              {filteredSections.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedSection && (
          <Button onClick={openAdd} size="sm">+ Add Period</Button>
        )}
      </div>

      {/* Feedback */}
      {error && (
        <div className="text-xs text-red-700 bg-red-50 p-2 rounded border border-red-200">{error}</div>
      )}
      {success && (
        <div className="text-xs text-green-700 bg-green-50 p-2 rounded border border-green-200">{success}</div>
      )}

      {/* Form */}
      {showForm && (
        <div className="border rounded-md p-4 flex flex-col gap-4 bg-muted/30">
          <h2 className="text-sm font-semibold">{editingId ? "Edit Period" : "Add Period"}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Date *</label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setF("date", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Period No *</label>
              <Select value={form.period_number} onValueChange={(v) => setF("period_number", v)}>
                <SelectTrigger><SelectValue placeholder="Select period" /></SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5,6,7,8].map((n) => (
                    <SelectItem key={n} value={String(n)}>Period {n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Start Time</label>
              <Select value={form.start_time} onValueChange={(v) => setF("start_time", v)}>
                <SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger>
                <SelectContent>
                  {TIMES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">End Time</label>
              <Select value={form.end_time} onValueChange={(v) => setF("end_time", v)}>
                <SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger>
                <SelectContent>
                  {TIMES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Subject</label>
              <Select value={form.subject_id} onValueChange={(v) => setF("subject_id", v)}>
                <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Teacher</label>
              <Select value={form.teacher_id} onValueChange={(v) => setF("teacher_id", v)}>
                <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>{t.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving} size="sm">
              {saving ? "Saving..." : editingId ? "Update" : "Add"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setShowForm(false); setEditingId(null); setError(""); }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      {selectedSection && (
        loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : slots.length === 0 ? (
          <p className="text-sm text-muted-foreground">No periods added yet. Click &quot;+ Add Period&quot; to start.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slots.map((slot) => (
                <TableRow key={slot.id}>
                  <TableCell>{slot.date ?? "—"}</TableCell>
                  <TableCell>{slot.period_number}</TableCell>
                  <TableCell>{slot.start_time ?? "—"}</TableCell>
                  <TableCell>{slot.end_time ?? "—"}</TableCell>
                  <TableCell>{subjectName(slot.subject_id)}</TableCell>
                  <TableCell>{teacherName(slot.teacher_id)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(slot)} className="text-xs text-blue-600 hover:underline">Edit</button>
                      <button onClick={() => handleDelete(slot.id)} className="text-xs text-red-600 hover:underline">Delete</button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )
      )}

      {!selectedSection && (
        <p className="text-sm text-muted-foreground">Select a class and section to view or manage timetable.</p>
      )}
    </div>
  );
}
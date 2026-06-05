"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getClassDetails } from "@/services/academic/classes";
import { getSubjects, Subject } from "@/services/academic/subjects";
import { getTeachers, TeacherRecord } from "@/services/users/teachers";
import {
  getTimetableBySection,
  upsertTimetableSlot,
  deleteTimetableSlot,
  TimetableEntry,
} from "@/services/academic/timetable";
import { Loader2, Plus, Trash2, PencilLine, CalendarDays } from "lucide-react";

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

// Colour tokens per period row for visual rhythm
const ROW_ACCENT: Record<number, string> = {
  1: "bg-sky-50",
  2: "bg-violet-50",
  3: "bg-emerald-50",
  4: "bg-amber-50",
  5: "bg-rose-50",
  6: "bg-sky-50",
  7: "bg-violet-50",
  8: "bg-emerald-50",
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface Section {
  id: number;
  name: string;
  student_count: number;
}

interface SlotEditState {
  day: string;
  period: number;
  existing: TimetableEntry | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ClassTimetablePage() {
  const params = useParams();
  const classId = Number(params.classId);

  // ── Core state
  const [className, setClassName] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<TeacherRecord[]>([]);

  // ── Loading / error
  const [pageLoading, setPageLoading] = useState(true);
  const [timetableLoading, setTimetableLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<SlotEditState | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [dialogError, setDialogError] = useState("");

  // ── Initial load: class details + subjects + teachers (all parallel)
  useEffect(() => {
    if (!classId || isNaN(classId)) {
      setError("Invalid class identifier in URL.");
      setPageLoading(false);
      return;
    }

    async function loadInitial() {
      try {
        setPageLoading(true);
        const [classDetails, subjectsData, teachersData] = await Promise.all([
          getClassDetails(classId),
          getSubjects(),
          getTeachers(),
        ]);

        setClassName(classDetails.name);
        setSections(classDetails.sections);
        setSubjects(subjectsData);
        setTeachers(teachersData);

        if (classDetails.sections.length > 0) {
          setSelectedSectionId(classDetails.sections[0].id);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load page data.");
      } finally {
        setPageLoading(false);
      }
    }

    loadInitial();
  }, [classId]);

  // ── Fetch timetable whenever selected section changes
  const loadTimetable = useCallback(async (sectionId: number) => {
    try {
      setTimetableLoading(true);
      setError("");
      const data = await getTimetableBySection(sectionId);
      setTimetable(data);
    } catch (err: any) {
      setError(err.message || "Failed to load timetable.");
    } finally {
      setTimetableLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedSectionId !== null) {
      loadTimetable(selectedSectionId);
    }
  }, [selectedSectionId, loadTimetable]);

  // ── Slot lookup: O(1) access by day-period key
  const slotMap = new Map<string, TimetableEntry>();
  timetable.forEach((entry) => {
    slotMap.set(`${entry.day_of_week}-${entry.period_number}`, entry);
  });

  // ── Open dialog for a cell
  const handleCellClick = (day: string, period: number) => {
    const existing = slotMap.get(`${day}-${period}`) ?? null;
    setEditingSlot({ day, period, existing });
    setSelectedSubjectId(existing?.subjects?.id?.toString() ?? "");
    setSelectedTeacherId(existing?.teachers?.id?.toString() ?? "none");
    setDialogError("");
    setDialogOpen(true);
  };

  // ── Save (upsert)
  const handleSaveSlot = async () => {
    if (!editingSlot || selectedSectionId === null) return;
    if (!selectedSubjectId) {
      setDialogError("Please select a subject before saving.");
      return;
    }

    try {
      setSaving(true);
      setDialogError("");
      await upsertTimetableSlot({
        section_id:    selectedSectionId,
        day_of_week:   editingSlot.day,
        period_number: editingSlot.period,
        subject_id:    parseInt(selectedSubjectId, 10),
        teacher_id: selectedTeacherId && selectedTeacherId !== "none" ? parseInt(selectedTeacherId, 10) : null,
      });
      setDialogOpen(false);
      await loadTimetable(selectedSectionId);
    } catch (err: any) {
      setDialogError(err.message || "Failed to save slot.");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete slot
  const handleDeleteSlot = async () => {
    if (!editingSlot?.existing || selectedSectionId === null) return;

    try {
      setSaving(true);
      setDialogError("");
      await deleteTimetableSlot(editingSlot.existing.id);
      setDialogOpen(false);
      await loadTimetable(selectedSectionId);
    } catch (err: any) {
      setDialogError(err.message || "Failed to clear slot.");
    } finally {
      setSaving(false);
    }
  };

  // ── Full-page loading
  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
      </div>
    );
  }

  // ── Render
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Breadcrumb + Title */}
      <div className="flex flex-col gap-1">
        <Link
          href="/admin/timetable"
          className="text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
        >
          ← Back to Classes
        </Link>
        <div className="flex items-center gap-3 mt-1">
          <CalendarDays className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold tracking-tight">
            Timetable — {className}
          </h1>
        </div>
        <p className="text-sm text-muted-foreground pl-9">
          Click any cell to assign or edit a subject and teacher.
        </p>
      </div>

      {/* Page-level error */}
      {error && (
        <div className="text-sm text-red-500 bg-red-50 border border-red-200 p-3 rounded-md">
          {error}
        </div>
      )}

      {/* No sections guard */}
      {sections.length === 0 && !error ? (
        <div className="border border-dashed rounded-xl p-12 text-center text-slate-500 text-sm">
          No sections found for this class. Add sections from Academic → Classes.
        </div>
      ) : (
        <>
          {/* Section tabs */}
          <div className="flex gap-2 flex-wrap">
            {sections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setSelectedSectionId(sec.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  selectedSectionId === sec.id
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-slate-50"
                }`}
              >
                {sec.name}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
            {timetableLoading ? (
              <div className="flex items-center justify-center h-52">
                <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
              </div>
            ) : (
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
                    <tr
                      key={period}
                      className="border-b last:border-b-0"
                    >
                      {/* Period label */}
                      <td className={`p-3 border-r ${ROW_ACCENT[period]}`}>
                        <span className="font-mono text-xs font-bold text-slate-500">
                          P{period}
                        </span>
                      </td>

                      {/* Day cells */}
                      {DAYS.map((day) => {
                        const slot = slotMap.get(`${day}-${period}`);
                        return (
                          <td key={day} className="p-1.5">
                            <button
                              onClick={() => handleCellClick(day, period)}
                              title={
                                slot
                                  ? `Edit: ${slot.subjects?.name}`
                                  : `Assign ${day} Period ${period}`
                              }
                              className={`w-full min-h-[58px] rounded-lg border-2 p-2 text-left transition-all hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                                slot
                                  ? "border-blue-200 bg-blue-50 hover:border-blue-400 hover:bg-blue-100"
                                  : "border-dashed border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                              }`}
                            >
                              {slot ? (
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-xs font-semibold text-blue-900 leading-tight line-clamp-1">
                                    {slot.subjects?.name ?? "—"}
                                  </span>
                                  <span className="text-[11px] text-slate-500 leading-tight line-clamp-1">
                                    {slot.teachers?.profiles?.full_name ?? (
                                      <em className="text-slate-400">No teacher</em>
                                    )}
                                  </span>
                                  {slot.subjects?.code && (
                                    <span className="text-[10px] font-mono text-blue-400 mt-0.5">
                                      {slot.subjects.code}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="flex items-center gap-1 text-slate-300 text-xs">
                                  <Plus className="h-3 w-3" />
                                  Assign
                                </span>
                              )}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm border-2 border-blue-200 bg-blue-50 inline-block" />
              Assigned slot
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm border-2 border-dashed border-slate-200 inline-block" />
              Empty — click to assign
            </span>
          </div>
        </>
      )}

      {/* ── Slot Edit Dialog ───────────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!saving) setDialogOpen(open); }}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingSlot?.existing ? (
                <PencilLine className="h-4 w-4 text-blue-600" />
              ) : (
                <Plus className="h-4 w-4 text-emerald-600" />
              )}
              {editingSlot?.existing ? "Edit Slot" : "Assign Slot"}
              <span className="text-slate-400 font-normal text-sm ml-1">
                — {editingSlot?.day} · Period {editingSlot?.period}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            {dialogError && (
              <div className="text-xs text-red-500 bg-red-50 border border-red-200 p-2.5 rounded-md">
                {dialogError}
              </div>
            )}

            {/* Subject */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">
                Subject <span className="text-red-500">*</span>
              </label>
              <Select
                value={selectedSubjectId}
                onValueChange={setSelectedSubjectId}
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject…" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.length === 0 ? (
                    <SelectItem value="" disabled>
                      No subjects found — add them first
                    </SelectItem>
                  ) : (
                    subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        <span className="font-medium">{s.name}</span>
                        <span className="text-slate-400 text-xs ml-2">
                          {s.code}
                        </span>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Teacher */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">
                Teacher{" "}
                <span className="text-slate-400 font-normal text-xs">(optional)</span>
              </label>
              <Select
                value={selectedTeacherId}
                onValueChange={setSelectedTeacherId}
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a teacher…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— None assigned —</SelectItem>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id.toString()}>
                      {t.profiles?.full_name ?? `Teacher #${t.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            {/* Delete — only shows when editing an existing slot */}
            {editingSlot?.existing && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSlot}
                disabled={saving}
                className="mr-auto"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Clear Slot
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              onClick={handleSaveSlot}
              disabled={saving || !selectedSubjectId}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editingSlot?.existing ? (
                <PencilLine className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {editingSlot?.existing ? "Update" : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
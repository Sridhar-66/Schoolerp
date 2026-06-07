"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getExams,
  getExamFormOptions,
  createExam,
  updateExam,
  deleteExam,
  ExamRow,
  SubjectOption,
  SectionOption,
  AcademicYearOption,
  CreateExamPayload,
} from "@/services/academic/exams";
import { PlusIcon, PencilIcon, TrashIcon, CalendarIcon } from "lucide-react";

type FormState = {
  name: string;
  exam_date: string;
  subject_id: string;
  section_id: string;
  academic_year_id: string;
  max_marks: string;
};

const emptyForm: FormState = {
  name: "",
  exam_date: "",
  subject_id: "",
  section_id: "",
  academic_year_id: "",
  max_marks: "100",
};

function getStatus(exam_date: string | null): {
  label: string;
  className: string;
} {
  if (!exam_date) return { label: "No Date", className: "bg-muted text-muted-foreground" };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(exam_date);
  if (d < today) return { label: "Completed", className: "bg-emerald-100 text-emerald-700" };
  return { label: "Upcoming", className: "bg-blue-100 text-blue-700" };
}

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ExaminationsPage() {
  const [exams, setExams] = useState<ExamRow[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [sections, setSections] = useState<SectionOption[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYearOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamRow | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<ExamRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filter
  const [statusFilter, setStatusFilter] = useState<"all" | "upcoming" | "completed">("all");
  const [search, setSearch] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const [examData, options] = await Promise.all([
        getExams(),
        getExamFormOptions(),
      ]);
      setExams(examData);
      setSubjects(options.subjects);
      setSections(options.sections);
      setAcademicYears(options.academicYears);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditingExam(null);
    // Pre-select current academic year if available
    const currentYear = academicYears.find((y) => y.is_current);
    setForm({
      ...emptyForm,
      academic_year_id: currentYear ? String(currentYear.id) : "",
    });
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(exam: ExamRow) {
    setEditingExam(exam);
    setForm({
      name: exam.name,
      exam_date: exam.exam_date ?? "",
      subject_id: exam.subject_id ? String(exam.subject_id) : "",
      section_id: exam.section_id ? String(exam.section_id) : "",
      academic_year_id: exam.academic_year_id
        ? String(exam.academic_year_id)
        : "",
      max_marks: String(exam.max_marks),
    });
    setFormError(null);
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setFormError("Exam name is required.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const payload: CreateExamPayload = {
        name: form.name.trim(),
        exam_date: form.exam_date || null,
        subject_id: form.subject_id ? Number(form.subject_id) : null,
        section_id: form.section_id ? Number(form.section_id) : null,
        academic_year_id: form.academic_year_id
          ? Number(form.academic_year_id)
          : null,
        max_marks: Number(form.max_marks) || 100,
      };

      if (editingExam) {
        await updateExam({ ...payload, id: editingExam.id });
      } else {
        await createExam(payload);
      }
      setModalOpen(false);
      await load();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteExam(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  }

  const filtered = exams.filter((e) => {
    const status = getStatus(e.exam_date).label.toLowerCase();
    if (statusFilter === "upcoming" && status !== "upcoming") return false;
    if (statusFilter === "completed" && status !== "completed") return false;
    if (
      search &&
      !e.name.toLowerCase().includes(search.toLowerCase()) &&
      !(e.subject_name ?? "").toLowerCase().includes(search.toLowerCase()) &&
      !(e.section_display_name ?? "").toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Examinations</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage exam schedules visible to students
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <PlusIcon className="w-4 h-4" />
          Add Exam
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <Input
          placeholder="Search by name, subject or section…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex gap-1 border rounded-md p-1">
          {(["all", "upcoming", "completed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1 text-xs rounded capitalize transition-colors ${
                statusFilter === f
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <span className="text-sm text-muted-foreground ml-auto">
          {filtered.length} exam{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md bg-destructive/10 text-destructive px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Exam Name</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Max Marks</TableHead>
              <TableHead>Academic Year</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <CalendarIcon className="w-8 h-8 opacity-30" />
                    <span>No exams found.</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((exam) => {
                const status = getStatus(exam.exam_date);
                return (
                  <TableRow key={exam.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{exam.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {exam.subject_name ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {exam.section_display_name ?? "—"}
                    </TableCell>
                    <TableCell>{formatDate(exam.exam_date)}</TableCell>
                    <TableCell>{exam.max_marks}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {exam.academic_year_name ?? "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(exam)}
                          className="h-8 w-8 p-0"
                        >
                          <PencilIcon className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(exam)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingExam ? "Edit Exam" : "Add New Exam"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">
                Exam Name <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="e.g. Mid-Term Examination"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            {/* Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Exam Date</label>
              <Input
                type="date"
                value={form.exam_date}
                onChange={(e) => setForm({ ...form, exam_date: e.target.value })}
              />
            </div>

            {/* Subject */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Subject</label>
              <Select
                value={form.subject_id}
                onValueChange={(v) => setForm({ ...form, subject_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name} ({s.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Section */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Section</label>
              <Select
                value={form.section_id}
                onValueChange={(v) => setForm({ ...form, section_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.class_name} - {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Academic Year */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Academic Year</label>
              <Select
                value={form.academic_year_id}
                onValueChange={(v) =>
                  setForm({ ...form, academic_year_id: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((y) => (
                    <SelectItem key={y.id} value={String(y.id)}>
                      {y.name} {y.is_current ? "(Current)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Max Marks */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Max Marks</label>
              <Input
                type="number"
                min={1}
                value={form.max_marks}
                onChange={(e) => setForm({ ...form, max_marks: e.target.value })}
              />
            </div>

            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setModalOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : editingExam ? "Save Changes" : "Create Exam"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exam?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>{deleteTarget?.name}</strong>. This action cannot be
              undone and will also remove any associated marks records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, ClipboardSignature, CalendarDays, Award, X, Loader2 } from "lucide-react";
import { getExams, getExamFormLookups, createExam, ExamRecord } from "@/services/academic/exams";

export default function ExamsAdminDashboard() {
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [lookups, setLookups] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal Overlay control state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [examsList, formOptions] = await Promise.all([
        getExams(),
        getExamFormLookups()
      ]);
      setExams(examsList);
      setLookups(formOptions);
    } catch (err: any) {
      setError(err.message || "Failed to sync system examinations framework.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    
    try {
      await createExam({
        name: formData.get("name") as string,
        subject_id: Number(formData.get("subject_id")),
        section_id: Number(formData.get("section_id")),
        academic_year_id: Number(formData.get("academic_year_id")),
        exam_date: formData.get("exam_date") as string,
        max_marks: Number(formData.get("max_marks")),
      });

      setIsModalOpen(false);
      await loadData(); // Reload table data smoothly
    } catch (err: any) {
      setError(err.message || "Could not publish assessment profile row.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Examinations Registry</h1>
          <p className="text-sm text-muted-foreground">
            Schedule centralized assessments. Published records reflect in real-time across targeted student dashboards.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" /> Add Exam
        </Button>
      </div>

      {error && (
        <div className="text-xs text-red-500 bg-red-50 p-3 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {/* DATA VIEW GRID TABLE */}
      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/70">
            <TableRow>
              <TableHead>Exam Identifier</TableHead>
              <TableHead>Target Allocation (Class/Section)</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Execution Date</TableHead>
              <TableHead>Max Score</TableHead>
              <TableHead className="text-right">Academic Session</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-slate-400 animate-pulse font-medium">
                  Querying relational evaluation records...
                </TableCell>
              </TableRow>
            ) : exams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                  No examinations have been scheduled for this timeline.
                </TableCell>
              </TableRow>
            ) : (
              exams.map((exam) => (
                <TableRow key={exam.id} className="hover:bg-slate-50/40 transition-colors">
                  <TableCell className="font-bold text-slate-900 flex items-center gap-2">
                    <ClipboardSignature className="h-4 w-4 text-blue-500 shrink-0" />
                    {exam.name}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 rounded px-2.5 py-0.5">
                      {exam.sections?.classes?.name} — {exam.sections?.name}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium text-slate-700">
                    {exam.subjects?.name || "—"}
                  </TableCell>
                  <TableCell className="text-slate-600 text-xs font-mono">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                      {exam.exam_date ? new Date(exam.exam_date).toLocaleDateString("en-US", { dateStyle: "medium" }) : "Unset"}
                    </span>
                  </TableCell>
                  <TableCell className="font-bold text-emerald-600">
                    <span className="inline-flex items-center gap-1">
                      <Award className="h-3.5 w-3.5 text-emerald-500" />
                      {exam.max_marks} M
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium text-xs text-slate-500">
                    {exam.academic_years?.name || "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* PORTABLE LIGHTWEIGHT MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl border w-full max-w-lg overflow-hidden flex flex-col animate-scaleUp">
            <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50/80">
              <h3 className="font-bold text-slate-800 text-lg">Provision Institutional Assessment</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 transition-colors"
                disabled={submitting}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Assessment Name</label>
                <Input name="name" placeholder="e.g., Quarterly Mid-Term 1" required disabled={submitting} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Target Section Structure</label>
                  <select 
                    name="section_id" 
                    required 
                    disabled={submitting}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">-- Choose Section --</option>
                    {lookups?.sections.map((sec: any) => (
                      <option key={sec.id} value={sec.id}>{sec.display_name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Evaluation Subject</label>
                  <select 
                    name="subject_id" 
                    required 
                    disabled={submitting}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">-- Choose Subject --</option>
                    {lookups?.subjects.map((sub: any) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Maximum Evaluated Marks</label>
                  <Input type="number" name="max_marks" defaultValue="100" min="1" required disabled={submitting} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Academic Year Block</label>
                  <select 
                    name="academic_year_id" 
                    required 
                    disabled={submitting}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">-- Choose Year Block --</option>
                    {lookups?.academicYears.map((yr: any) => (
                      <option key={yr.id} value={yr.id}>{yr.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Scheduled Calendar Date</label>
                <Input type="date" name="exam_date" required disabled={submitting} />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="min-w-[100px]">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish Exam"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
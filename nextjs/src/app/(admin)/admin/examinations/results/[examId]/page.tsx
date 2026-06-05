"use client";

import { useEffect, useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { getMarksEntryManifest, saveMarksManifest, StudentMarksRow } from "@/services/academic/marks";

interface PageProps {
  params: Promise<{ examId: string }>;
}

export default function MarksEntrySpreadsheet({ params }: PageProps) {
  // Safe Next.js 15 async parameter resolution
  const resolvedParams = use(params);
  const examId = Number(resolvedParams.examId);

  const [examInfo, setExamInfo] = useState<any>(null);
  const [gridData, setGridData] = useState<StudentMarksRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    const fetchGrid = async () => {
      try {
        const data = await getMarksEntryManifest(examId);
        setExamInfo(data.examInfo);
        setGridData(data.manifest);
      } catch (err: any) {
        setNotification({ type: "error", message: err.message || "Failed to parse evaluation grid context." });
      } finally {
        setLoading(false);
      }
    };
    fetchGrid();
  }, [examId]);

  // Handle cell text adjustments dynamically inside state array
  const handleCellChange = (index: number, field: keyof StudentMarksRow, value: string) => {
    const updated = [...gridData];
    updated[index] = { ...updated[index], [field]: value };
    setGridData(updated);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setNotification(null);

    // Frontend validation step: Ensure values don't overflow the defined exam maximums
    for (const row of gridData) {
      if (row.marks_obtained !== "" && Number(row.marks_obtained) > examInfo.max_marks) {
        setNotification({
          type: "error",
          message: `Score overflow detected for ${row.student_name}. Max allowable score is ${examInfo.max_marks} Marks.`,
        });
        setSubmitting(false);
        return;
      }
    }

    try {
      await saveMarksManifest(examId, gridData);
      setNotification({ type: "success", message: "Student marks directory saved and published successfully." });
      
      // Re-sync data clean from database to update record IDs
      const refreshedData = await getMarksEntryManifest(examId);
      setGridData(refreshedData.manifest);
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || "Failed to commit score transactional manifest row." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-500 animate-pulse font-medium">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        Configuring evaluation spreadsheet channels...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" asChild className="h-9 w-9 border-slate-200">
          <a href="/admin/examinations">
            <ArrowLeft className="h-4 w-4 text-slate-600" />
          </a>
        </Button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Marks Assessment Ledger</h1>
          <p className="text-xs text-muted-foreground">Log grading performance matrix indicators into institutional storage tables.</p>
        </div>
      </div>

      {notification && (
        <div className={`p-3 rounded-md border flex items-start gap-2.5 text-xs font-medium shadow-sm transition-all ${
          notification.type === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
            : "bg-rose-50 border-rose-200 text-rose-800"
        }`}>
          {notification.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> : <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />}
          <span>{notification.message}</span>
        </div>
      )}

      {examInfo && (
        <Card className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-md border-0">
          <CardHeader className="pb-3">
            <span className="text-[10px] font-bold tracking-widest text-indigo-300 uppercase">Active Evaluation Hook</span>
            <CardTitle className="text-xl tracking-tight font-extrabold">{examInfo.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-slate-300">
            <div>Subject Block: <span className="font-bold text-white">{examInfo.subject_name}</span></div>
            <div className="border-l border-slate-700 pl-8">Maximum Scale Value: <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 rounded px-2 py-0.5">{examInfo.max_marks} M</span></div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div className="rounded-md border bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-32 font-bold text-slate-600">Roll Number</TableHead>
                <TableHead className="font-bold text-slate-600">Student Name</TableHead>
                <TableHead className="w-40 font-bold text-slate-600">Marks Obtained</TableHead>
                <TableHead className="font-bold text-slate-600">Internal Ledger Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gridData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-slate-400 font-medium">
                    No active student allocations configured for this target section group.
                  </TableCell>
                </TableRow>
              ) : (
                gridData.map((row, idx) => (
                  <TableRow key={row.student_id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="font-mono text-xs text-slate-500 font-semibold">{row.roll_no}</td>
                    <td className="font-bold text-slate-800 text-sm">{row.student_name}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          className="h-9 font-mono font-bold text-center text-slate-900 border-slate-200 focus-visible:ring-indigo-500 max-w-[100px]"
                          placeholder="0"
                          min="0"
                          max={examInfo?.max_marks}
                          step="0.5"
                          value={row.marks_obtained}
                          disabled={submitting}
                          onChange={(e) => handleCellChange(idx, "marks_obtained", e.target.value)}
                        />
                        <span className="text-xs text-slate-400 font-medium">/ {examInfo?.max_marks}</span>
                      </div>
                    </td>
                    <td>
                      <Input
                        className="h-9 text-xs border-slate-200 text-slate-700"
                        placeholder="e.g., Distinction, Absent, Remedial needed"
                        value={row.remarks}
                        disabled={submitting}
                        onChange={(e) => handleCellChange(idx, "remarks", e.target.value)}
                      />
                    </td>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {gridData.length > 0 && (
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting} className="gap-2 min-w-[140px] shadow-sm bg-indigo-600 hover:bg-indigo-700">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Publish Ledger
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
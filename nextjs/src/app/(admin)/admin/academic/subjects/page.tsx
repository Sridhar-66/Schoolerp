"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { getSubjects, addSubject, Subject } from "@/services/academic/subjects";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  // Form Field States
  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [error, setError] = useState("");

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const data = await getSubjects();
      setSubjects(data);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!subjectName.trim()) {
      setError("Subject description name cannot be blank.");
      return;
    }
    if (!subjectCode.trim()) {
      setError("Subject system code catalog key is required.");
      return;
    }

    try {
      setSubmitting(true);
      await addSubject(subjectName.trim(), subjectCode.trim().toUpperCase());
      
      setSubjectName("");
      setSubjectCode("");
      setOpen(false);
      await loadSubjects();
    } catch (err: any) {
      setError(err.message || "An error occurred writing course record.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Subjects</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Subject</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Course Subject</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSubject} className="flex flex-col gap-4 py-4">
              {error && (
                <div className="text-xs text-red-500 bg-red-50 p-2 rounded border border-red-200">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Subject Name</label>
                <Input
                  placeholder="e.g., Mathematics, Core Physics"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Subject Code</label>
                <Input
                  placeholder="e.g., MATH101, PHY-02"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Adding..." : "Save Subject"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject Code</TableHead>
            <TableHead>Subject Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={2} className="text-center py-6 text-muted-foreground">
                Syncing system curriculum maps...
              </TableCell>
            </TableRow>
          ) : subjects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2} className="text-center py-6 text-muted-foreground">
                No course subjects recorded yet. Click "Add Subject" to begin.
              </TableCell>
            </TableRow>
          ) : (
            subjects.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell className="font-mono text-xs font-semibold text-slate-600">
                  {sub.code}
                </TableCell>
                <TableCell className="font-medium">{sub.name}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

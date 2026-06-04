"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { getSections, addSection, SectionWithClass } from "@/services/academic/sections";
import { getClasses, ClassWithCount } from "@/services/academic/classes";

export default function SectionsPage() {
  const [sections, setSections] = useState<SectionWithClass[]>([]);
  const [classes, setClasses] = useState<ClassWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const [sectionName, setSectionName] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [sectionsData, classesData] = await Promise.all([
        getSections(),
        getClasses()
      ]);
      setSections(sectionsData);
      setClasses(classesData);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!sectionName.trim()) {
      setError("Section identifier name cannot be left empty.");
      return;
    }
    if (!selectedClassId) {
      setError("You must assign this section to a specific class tier.");
      return;
    }

    try {
      setSubmitting(true);
      await addSection(sectionName.trim(), parseInt(selectedClassId, 10));
      
      setSectionName("");
      setSelectedClassId("");
      setOpen(false);
      await loadData();
    } catch (err: any) {
      setError(err.message || "An error occurred writing section configuration.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sections</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Section</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Section Blueprint</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSection} className="flex flex-col gap-4 py-4">
              {error && (
                <div className="text-xs text-red-500 bg-red-50 p-2 rounded border border-red-200">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Section Name</label>
                <Input
                  placeholder="e.g., Section A, Alpha, Blue"
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Assign to Class Tier</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  disabled={submitting}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select a class level...</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Adding..." : "Save Section"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Section Name</TableHead>
            <TableHead>Assigned Class Tier</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={2} className="text-center py-6 text-muted-foreground">
                Retrieving active academic tracks...
              </TableCell>
            </TableRow>
          ) : sections.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2} className="text-center py-6 text-muted-foreground">
                No sections mapped yet. Click "Add Section" to configure your first layout.
              </TableCell>
            </TableRow>
          ) : (
            sections.map((sec) => (
              <TableRow key={sec.id}>
                <TableCell className="font-medium">Section {sec.name}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                    {sec.classes?.name || "Unassigned"}
                  </span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { getClasses, addClass, ClassWithCount } from "@/services/academic/classes";

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  
  // Form State
  const [className, setClassName] = useState("");
  const [error, setError] = useState("");

  const loadClasses = async () => {
    try {
      setLoading(true);
      const data = await getClasses();
      setClasses(data);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!className.trim()) {
      setError("Class name designation cannot be blank.");
      return;
    }

    try {
      setSubmitting(true);
      await addClass(className.trim());
      setClassName("");
      setOpen(false); // Close Modal
      await loadClasses(); // Refresh data table
    } catch (err: any) {
      setError(err.message || "An error occurred writing class to database.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Classes</h1>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Class</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Class Tier</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateClass} className="flex flex-col gap-4 py-4">
              {error && (
                <div className="text-xs text-red-500 bg-red-50 p-2 rounded border border-red-200">
                  {error}
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Class Name / Level</label>
                <Input 
                  placeholder="e.g., Grade 10, Class 5" 
                  value={className} 
                  onChange={(e) => setClassName(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Adding..." : "Save Class"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Class Name</TableHead>
            <TableHead>Section Count</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                Syncing structure records...
              </TableCell>
            </TableRow>
          ) : classes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                No active classes recorded. Click "Add Class" to start.
              </TableCell>
            </TableRow>
          ) : (
            classes.map((cls) => (
              <TableRow key={cls.id}>
                <TableCell className="font-medium">{cls.name}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    {cls.section_count} {cls.section_count === 1 ? "Section" : "Sections"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/admin/academic/classes/${cls.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
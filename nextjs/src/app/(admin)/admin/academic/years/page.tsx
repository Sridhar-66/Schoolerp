"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { getAcademicYears, addAcademicYear, setYearAsCurrent } from "@/services/academic/years";

interface AcademicYear {
  id: number;
  name: string;
  is_current: boolean;
  start_date: string;
  end_date: string;
}

export default function AcademicYearsPage() {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  
  // Form State
  const [yearName, setYearName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCurrent, setIsCurrent] = useState(false);
  const [error, setError] = useState("");

  const loadYears = async () => {
    try {
      setLoading(true);
      const data = await getAcademicYears();
      setYears(data as AcademicYear[]);
    } catch (err: any) {
      console.error(err.message);
    } bits: {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadYears();
  }, []);

  const handleCreateYear = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!yearName.trim()) {
      setError("Please input a valid session title (e.g., 2026-2027)");
      return;
    }
    if (!startDate || !endDate) {
      setError("Both start and end operational dates are strictly required.");
      return;
    }

    try {
      setSubmitting(true);
      await addAcademicYear(yearName, isCurrent, startDate, endDate);
      
      // Reset form variables
      setYearName("");
      setStartDate("");
      setEndDate("");
      setIsCurrent(false);
      setOpen(false); 
      await loadYears(); 
    } catch (err: any) {
      setError(err.message || "An error occurred compiling entry.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      await setYearAsCurrent(id);
      await loadYears();
    } catch (err: any) {
      alert(err.message || "Could not switch active profile parameters.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Academic Years</h1>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Year</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Academic Session</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateYear} className="flex flex-col gap-4 py-4">
              {error && (
                <div className="text-xs text-red-500 bg-red-50 p-2 rounded border border-red-200">
                  {error}
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Session Label Name</label>
                <Input 
                  placeholder="e.g., 2026-2027" 
                  value={yearName} 
                  onChange={(e) => setYearName(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Input 
                    type="date"
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={submitting}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">End Date</label>
                  <Input 
                    type="date"
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="checkbox" 
                  id="is_current" 
                  checked={isCurrent} 
                  onChange={(e) => setIsCurrent(e.target.checked)}
                  disabled={submitting}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="is_current" className="text-sm font-medium cursor-pointer">
                  Set as current active academic session
                </label>
              </div>

              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Adding..." : "Save Session"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Year Session</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                Retrieving active academic configurations...
              </TableCell>
            </TableRow>
          ) : years.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                No configured sessions discovered in storage registry.
              </TableCell>
            </TableRow>
          ) : (
            years.map((y) => (
              <TableRow key={y.id}>
                <TableCell className="font-medium">{y.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {y.start_date} to {y.end_date}
                </TableCell>
                <TableCell>
                  {y.is_current ? (
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                      Active Current
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                      Inactive
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {!y.is_current && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleToggleActive(y.id)}
                    >
                      Make Active
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
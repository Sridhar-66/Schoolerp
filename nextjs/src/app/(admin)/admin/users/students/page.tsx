"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GraduationCap, Calendar, User, ShieldAlert } from "lucide-react";
import { getStudents, StudentRecord } from "@/services/students/students";

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDirectory = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getStudents();
      
      // Sort alphabetically using the nested profile name object safely
      const sorted = [...data].sort((a, b) => {
        const nameA = (a.profiles?.full_name || "Unnamed").toLowerCase();
        const nameB = (b.profiles?.full_name || "Unnamed").toLowerCase();
        return nameA.localeCompare(nameB);
      });

      setStudents(sorted);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to resolve relational student layouts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDirectory();
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Students Directory</h1>
          <p className="text-sm text-muted-foreground">
            Manage institutional roster details, tracking class mappings and academic year allocations.
          </p>
        </div>
        <Button asChild className="font-medium bg-indigo-600 hover:bg-indigo-700 shadow-sm">
          <Link href="/admin/users/students/add">Add Student</Link>
        </Button>
      </div>

      {error && (
        <div className="text-xs text-red-500 bg-red-50 p-3 rounded-md border border-red-200 shadow-sm flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[120px] font-bold text-slate-600">Roll Number</TableHead>
              <TableHead className="font-bold text-slate-600">Student Name</TableHead>
              <TableHead className="font-bold text-slate-600">Class</TableHead>
              <TableHead className="font-bold text-slate-600">Section</TableHead>
              <TableHead className="font-bold text-slate-600">Academic Year</TableHead>
              <TableHead className="font-bold text-slate-600">Parent / Guardian</TableHead>
              <TableHead className="text-right font-bold text-slate-600">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground animate-pulse font-medium">
                  Synchronizing database registration registry rows...
                </TableCell>
              </TableRow>
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-12 font-medium">
                  No student records found in database arrays.
                </TableCell>
              </TableRow>
            ) : (
              students.map((s: any) => {
                const rollText = s.roll_number || `#${s.id}`;
                const fullNameText = s.profiles?.full_name || "Unnamed Student Account";
                
                // Safely resolving database-joined relations
                const classNameText = s.sections?.classes?.name || "Unassigned";
                const sectionNameText = s.sections?.name || "Unassigned";
                const academicYearText = s.academic_years?.name || s.academic_year?.name || "—";
                const parentText = s.parent_name || "—";

                return (
                  <TableRow key={s.id} className="hover:bg-slate-50/40 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-slate-500">
                      {rollText}
                    </TableCell>
                    <TableCell className="font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        {fullNameText}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-slate-700 text-sm">
                      {classNameText}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 rounded px-2.5 py-0.5">
                        {sectionNameText}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-600 text-xs">
                      <div className="flex items-center gap-1 font-medium">
                        <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        {academicYearText}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {parentText}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild className="text-xs h-8 border-slate-200 hover:bg-slate-50">
                        <Link href={`/admin/users/students/${s.id}`}>
                          View Profile
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getTeachers, TeacherRecord } from "@/services/users/teachers";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<TeacherRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDirectory = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getTeachers();
      
      const sorted = [...data].sort((a, b) => {
        const nameA = (a.profiles?.full_name || "Unnamed").toLowerCase();
        const nameB = (b.profiles?.full_name || "Unnamed").toLowerCase();
        return nameA.localeCompare(nameB);
      });

      setTeachers(sorted);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to parse teacher relation objects.");
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
          <h1 className="text-2xl font-bold tracking-tight">Teachers Directory</h1>
          <p className="text-sm text-muted-foreground">
            Manage institutional roster details and view profile assignments.
          </p>
        </div>
        <Button asChild className="font-medium">
          <Link href="/admin/users/teachers/add">Add Teacher</Link>
        </Button>
      </div>

      {error && (
        <div className="text-xs text-red-500 bg-red-50 p-3 rounded-md border border-red-200 shadow-sm">
          {error}
        </div>
      )}

      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Teacher ID</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Role Designation</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground animate-pulse">
                  Synchronizing precise directory registry database rows...
                </TableCell>
              </TableRow>
            ) : teachers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No teacher records assigned.
                </TableCell>
              </TableRow>
            ) : (
              teachers.map((t) => {
                const teacherIdText = t.employee_id ? t.employee_id : `#${t.id}`;
                const fullNameText = t.profiles?.full_name || "Unnamed Teacher";
                const typeText = t.teacher_type ? `${t.teacher_type} teacher` : "General staff";

                return (
                  <TableRow key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-slate-500">
                      {teacherIdText}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900">
                      {fullNameText}
                    </TableCell>
                    <TableCell className="capitalize text-xs">
                      <span className="bg-slate-100 border text-slate-700 font-medium px-2 py-0.5 rounded-md">
                        {typeText}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild className="text-xs h-8">
                        <Link href={`/admin/users/teachers/${t.id}`}>
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
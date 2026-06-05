"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getTeacherById } from "@/services/users/teachers";

export default function TeacherProfilePage() {
  const params = useParams();
  // FIXED: Using teacherId to match your exact folder name!
  const teacherId = params.teacherId as string;

  const [teacher, setTeacher] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!teacherId) return;
      try {
        setLoading(true);
        const data = await getTeacherById(teacherId);
        setTeacher(data);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load teacher profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [teacherId]);

  if (loading) {
    return (
      <div className="p-6 text-muted-foreground animate-pulse font-medium">
        Loading teacher profile data...
      </div>
    );
  }

  if (error || !teacher) {
    return (
      <div className="p-6">
        <div className="text-red-500 bg-red-50 p-4 rounded-md border border-red-200">
          {error || "Profile not found in database."}
        </div>
        <Button asChild className="mt-4">
          <Link href="/admin/users/teachers">Back to Directory</Link>
        </Button>
      </div>
    );
  }

  // Schema-aligned data extraction
  const fullName = teacher.profiles?.full_name || "Unnamed Teacher";
  const empId = teacher.employee_id || `System ID #${teacher.id}`;
  const typeText = teacher.teacher_type ? `${teacher.teacher_type} teacher` : "General Staff";

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Teacher Profile</h1>
          <p className="text-sm text-muted-foreground">
            Viewing administrative record for <span className="font-semibold text-slate-800">{fullName}</span>
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/users/teachers">Back to Directory</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Details Card */}
        <Card className="md:col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Core Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Full Name</p>
              <p className="font-medium text-slate-900">{fullName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Employee ID</p>
              <p className="font-mono text-sm text-slate-700">{empId}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Designation</p>
              <p className="font-medium text-slate-900 capitalize">{typeText}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Email Contact</p>
              <p className="text-sm text-slate-500 italic">Managed via Auth Service</p>
            </div>
          </CardContent>
        </Card>

        {/* Classes Table Card */}
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Assigned Sections & Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Subject</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                    No active class assignments found for this academic year.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
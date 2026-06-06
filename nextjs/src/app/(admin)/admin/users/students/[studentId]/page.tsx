"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createClient } from "@/lib/supabase/client";

interface StudentDetailsPageProps {
  params: any; // Flexible typing to accommodate both Next 14 object structures and Next 15 promises
}

export default function StudentDetailsPage({ params }: StudentDetailsPageProps) {
  const [student, setStudent] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Failsafe extractor to resolve structural array vs flat object conversions safely
  const extractNestedData = (relation: any, key: string): string | null => {
    if (!relation) return null;
    if (Array.isArray(relation)) {
      return relation[0]?.[key] ?? null;
    }
    return relation[key] ?? null;
  };

  useEffect(() => {
    const resolveParamsAndFetch = async () => {
      try {
        // Dynamic Unwrapper: Resolves seamlessly whether params is a Promise (Next 15) or a raw Object (Next 14)
        const resolvedParams = params instanceof Promise ? await params : params;
        
        // Supports both folder naming formats: [id] or [studentId]
        const studentId = resolvedParams?.id || resolvedParams?.studentId;

        if (!studentId) {
          console.error("Administrative Routing Error: No valid student ID parameter detected.");
          setLoading(false);
          return;
        }

        const supabase = createClient();

        // 1. Fetch deep relational profile dataset
        const { data: studentData, error: studentError } = await supabase
          .from("students")
          .select(`
            id,
            roll_number,
            student_type,
            parent_name,
            parent_phone,
            dob,
            address,
            profiles ( full_name, phone, role ),
            classes ( name ),
            sections ( name )
          `)
          .eq("id", studentId)
          .maybeSingle();

        if (studentError) throw studentError;
        setStudent(studentData);

        // 2. Fetch linked attendance logs
        const { data: attendanceData, error: attendanceError } = await supabase
          .from("attendance")
          .select("id, date, status, remarks")
          .eq("student_id", studentId)
          .order("date", { ascending: false })
          .limit(10);

        if (!attendanceError && attendanceData) {
          setAttendance(attendanceData);
        }
      } catch (error) {
        console.error("Critical error processing detailed student profile context:", error);
      } finally {
        // Guaranteed execution hook to prevent infinite loading lockups
        setLoading(false);
      }
    };

    resolveParamsAndFetch();
  }, [params]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground animate-pulse font-medium">Resolving academic dossier stream...</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center min-h-[300px]">
        <p className="text-muted-foreground font-medium">Target student record registry entry could not be located.</p>
        <Button asChild variant="outline">
          <Link href="/admin/users/students">Return to Main Directory</Link>
        </Button>
      </div>
    );
  }

  // Safe extractions mapping directly to our proven database schema architecture
  const fullName = extractNestedData(student.profiles, "full_name") ?? "No Linked Profile Row";
  const phoneNo = extractNestedData(student.profiles, "phone") ?? "—";
  const className = extractNestedData(student.classes, "name") ?? "Unassigned Class";
  const sectionName = extractNestedData(student.sections, "name") ?? "Unassigned Section";

  return (
    <div className="flex flex-col gap-6">
      {/* Header Context Tracking Frame */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/admin/users/students" className="hover:underline">Students</Link>
            <span>/</span>
            <span className="text-foreground font-medium">Dossier</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{fullName}</h1>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/users/students">Back to List</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Academic Card Detail Grid Panel */}
        <Card className="lg:col-span-1 shadow-xs border bg-background">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="text-base font-semibold">Administrative Coordinates</CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Classification</span>
              <p className="text-sm font-medium text-foreground">{className} ({sectionName})</p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Institutional Roll</span>
              <p className="text-sm font-mono text-foreground font-semibold">{student.roll_number ?? "—"}</p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Enrollment Modality</span>
              <p className="text-sm font-medium capitalize text-foreground">{student.student_type || "—"}</p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Primary Telephone</span>
              <p className="text-sm font-medium text-foreground">{phoneNo}</p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Date of Birth</span>
              <p className="text-sm font-medium text-foreground">
                {student.dob ? new Date(student.dob).toLocaleDateString("en-US", { dateStyle: "long" }) : "—"}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Residential Address</span>
              <p className="text-sm text-muted-foreground leading-relaxed">{student.address ?? "—"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Family Context & Attendance Logs Matrices */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Family & Guardians Card Info Row */}
          <Card className="shadow-xs border bg-background">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-base font-semibold">Guardian Affiliation Parameters</CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Parent/Guardian Name</span>
                <p className="text-sm font-medium text-foreground">{student.parent_name ?? "—"}</p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Emergency Phone Link</span>
                <p className="text-sm font-medium text-foreground">{student.parent_phone ?? "—"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Core Attendance Stream Matrix Summary */}
          <Card className="shadow-xs border bg-background">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-base font-semibold">Recent Attendance Log Stream</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="w-[180px]">Date Stamp</TableHead>
                    <TableHead className="w-[140px]">Status Check</TableHead>
                    <TableHead>Administrative Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-10 font-medium">
                        No current analytical attendance records mapped to this tracking stream ID.
                      </TableCell>
                    </TableRow>
                  ) : (
                    attendance.map((log) => (
                      <TableRow key={log.id} className="hover:bg-muted/10 transition-colors">
                        <TableCell className="font-mono text-sm">
                          {new Date(log.date).toLocaleDateString("en-US", { dateStyle: "medium" })}
                        </TableCell>
                        <TableCell>
                          {log.status?.toLowerCase() === "present" ? (
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                              Present
                            </span>
                          ) : log.status?.toLowerCase() === "absent" ? (
                            <span className="inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive border border-destructive/20">
                              Absent
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                              Late
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm max-w-xs truncate">
                          {log.remarks ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
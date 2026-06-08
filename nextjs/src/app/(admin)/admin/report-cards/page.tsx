"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StudentDirectoryRow {
  id: number;
  roll_no: string | null;
  student_name: string | null;
  class_name?: string;
}

export default function AdminReportCardsMasterPage() {
  const [students, setStudents] = useState<StudentDirectoryRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDirectory = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        
        const { data, error } = await supabase
          .from("students")
          .select("id, roll_no");

        if (error) {
          // 1. Log the absolute raw object directly without wrapper text
          console.error("RAW SUPABASE ERROR OBJECT:", error);
          
          // 2. Force convert to a flat string to bypass terminal serialization bugs
          console.error("STRINGIFIED ERROR:", JSON.stringify(error, null, 2));
          
          // 3. Throw a visible screen notification so you don't even need the console
          alert(`Supabase Rejected: ${error.message || "Check inspect console"}\nCode: ${error.code}`);
          
          throw error;
        }

        const formatted: StudentDirectoryRow[] = (data || []).map((s: any) => ({
          id: s.id,
          roll_no: s.roll_no,
          student_name: s.student_name || `Student Ref #${s.id}`,
          class_name: "Active Student"
        }));

        setStudents(formatted);
      } catch (err: any) {
        console.error("Runtime exception caught:", err?.message || err);
      } finally {
        setLoading(false);
      }
    };

    fetchDirectory();
  }, []);

  const filteredStudents = students.filter(
    (s) =>
      s.roll_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.student_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Academic Report Center</h1>
        <p className="text-sm text-muted-foreground">
          Global administrative access to verify and review all student marks, exam instances, and grade balances.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Registered Profiles</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-3xl font-bold">{loading ? "..." : students.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4 max-w-sm">
        <Input
          placeholder="Search by name or roll number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-white h-9"
        />
      </div>

      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Roll Reference</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead>Assigned Academic Class</TableHead>
              <TableHead className="text-right">Action Overrides</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                  Syncing student directories securely...
                </TableCell>
              </TableRow>
            ) : filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                  No matching student records located.
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow key={student.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-mono text-xs font-bold text-slate-600">
                    {student.roll_no || "N/A"}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">
                    {student.student_name}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                      {student.class_name}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/report-cards/${student.id}`}>
                      <Button size="sm" variant="outline" className="text-xs font-medium h-8">
                        View Report Card
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

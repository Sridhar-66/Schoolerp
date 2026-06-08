"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MarksDashboardPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchAllAssignments = async () => {
      setIsLoading(true);
      try {
        console.log("📡 Fetching all assignments for dashboard...");
        const { data, error: fetchError } = await (supabase.from('assignment_with_totals') as any)
          .select('id, title, max_marks')
          .order('id', { ascending: false });

        if (fetchError) throw fetchError;
        setAssignments(data || []);
      } catch (err: any) {
        console.error("❌ Error loading dashboard metrics:", err);
        setError(err.message || "Failed to load assignments.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllAssignments();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Marks Management</h1>
        <p className="text-slate-500 mt-1">Select an assignment or exam below to view and grade student submissions.</p>
      </div>

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-700">Active Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-slate-500">Loading assignments dashboard...</div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-8 text-slate-500 italic">No assignments found in the system.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Exam ID</TableHead>
                  <TableHead>Title / Description</TableHead>
                  <TableHead>Total Possible Marks</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((exam) => (
                  <TableRow key={exam.id} className="hover:bg-slate-50">
                    <TableCell className="font-mono text-sm text-slate-600">#{exam.id}</TableCell>
                    <TableCell className="font-medium text-slate-800">{exam.title}</TableCell>
                    <TableCell>
                      <span className="bg-slate-100 px-2.5 py-1 rounded text-sm font-semibold text-slate-600 border">
                        {exam.max_marks || 0} Marks
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {/* Dynamically links directly into the subfolder [examid] */}
                      <Link href={`/teacher/marks/${exam.id}`}>
                        <Button size="sm" variant="outline" className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200">
                          View & Grade Submissions →
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
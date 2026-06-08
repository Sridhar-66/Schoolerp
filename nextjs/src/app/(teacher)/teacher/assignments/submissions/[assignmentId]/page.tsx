"use client";

// 1. Imported 'use' from react to unwrap the asynchronous params object
import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";

// 2. Explicitly type params as a Promise for Next.js 15 compatibility
interface PageProps {
  params: Promise<{ assignmentId: string }>;
}

export default function AssignmentSubmissionsPage({ params }: PageProps) {
  // 3. Unwrap the params Promise synchronously inside the render loop
  const resolvedParams = use(params);
  const assignmentId = parseInt(resolvedParams.assignmentId);

  const [assignment, setAssignment] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<{ [key: number]: { grade: string; feedback: string } }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      // Cast table selection to bypass template type limitations
      const { data: assignData, error: assignError } = await (supabase.from('assignments') as any)
        .select('title')
        .eq('id', assignmentId)
        .single();
      
      if (assignError) throw assignError;
      setAssignment(assignData);

      // Cast table selection to bypass template type limitations
      const { data: subData, error: subError } = await (supabase.from('assignment_submissions') as any)
        .select('*')
        .eq('assignment_id', assignmentId)
        .order('submitted_at', { ascending: false });

      if (subError) throw subError;
      
      setSubmissions(subData || []);
      
      // Initialize drafts for inline editing
      const initialDrafts: any = {};
      subData?.forEach((sub: any) => {  
        initialDrafts[sub.id] = {
          grade: sub.grade || "",
          feedback: sub.feedback || ""
        };
      });
      setDrafts(initialDrafts);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (assignmentId) {
      fetchSubmissions();
    }
  }, [assignmentId]);

  const updateDraft = (id: number, field: 'grade' | 'feedback', value: string) => {
    setDrafts(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const saveGrade = async (submissionId: number) => {
    setSavingId(submissionId);
    setError(null);
    try {
      const { grade, feedback } = drafts[submissionId];
      // Fixed: cast table selector to any
      const { error } = await (supabase.from('assignment_submissions') as any)
        .update({ grade, feedback })
        .eq('id', submissionId);

      if (error) throw error;
      
      // Update the main submissions array to reflect saved state
      setSubmissions(prev => prev.map(s => s.id === submissionId ? { ...s, grade, feedback } : s));
      alert("Grade saved successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 text-slate-500 mb-2">
        <Link href="/teacher/assignments" className="hover:underline">← Back to Assignments</Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-slate-800">Student Submissions</h1>
        {assignment && <p className="text-slate-500 text-lg">{assignment.title}</p>}
      </div>

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-4 text-slate-500">Loading submissions...</div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-4 text-slate-500 italic">No submissions received yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Submitted At</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Feedback</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((sub) => (
                  <TableRow key={sub.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium">#{sub.student_id}</TableCell>
                    <TableCell>{sub.submitted_at ? new Date(sub.submitted_at).toLocaleString() : "-"}</TableCell>
                    <TableCell>
                      {sub.file_url ? (
                        <a href={sub.file_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium">
                          View File
                        </a>
                      ) : (
                        <span className="text-slate-400">No file</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Input 
                        className="w-24"
                        placeholder="e.g. A, 95/100"
                        value={drafts[sub.id]?.grade || ""} 
                        onChange={(e) => updateDraft(sub.id, 'grade', e.target.value)} 
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        className="w-full min-w-[200px]"
                        placeholder="Great job..."
                        value={drafts[sub.id]?.feedback || ""} 
                        onChange={(e) => updateDraft(sub.id, 'feedback', e.target.value)} 
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        onClick={() => saveGrade(sub.id)}
                        disabled={savingId === sub.id}
                      >
                        {savingId === sub.id ? "Saving..." : "Save"}
                      </Button>
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
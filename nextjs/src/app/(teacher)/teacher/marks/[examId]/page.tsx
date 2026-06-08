"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

interface PageProps {
  // 1. Matched exactly to your folder's bracket casing: examId
  params: Promise<{ examId: string }>; 
}

export default function AssignmentSubmissionsPage({ params }: PageProps) {
  // 2. Extract examId with the correct capital letter
  const resolvedParams = use(params);
  const assignmentId = parseInt(resolvedParams.examId);

  const [assignment, setAssignment] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<{ [key: number]: { grade: string; feedback: string } }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchSubmissions = async () => {
    console.log("🚀 fetchSubmissions() started for ID:", assignmentId);
    setIsLoading(true);
    setError(null);
    try {
      console.log("📡 Fetching assignment metadata...");
      const { data: assignData, error: assignError } = await (supabase.from('assignment_with_totals') as any)
        .select('title, max_marks')
        .eq('id', assignmentId)
        .single();
      
      if (assignError) {
        console.error("❌ Database view fetch error:", assignError);
        throw assignError;
      }
      setAssignment(assignData);
      console.log("✅ Assignment data loaded:", assignData);

      console.log("📡 Fetching student submissions...");
      const { data: subData, error: subError } = await (supabase.from('assignment_submissions') as any)
        .select('*')
        .eq('assignment_id', assignmentId)
        .order('submitted_at', { ascending: false });

      if (subError) {
        console.error("❌ Submissions fetch error:", subError);
        throw subError;
      }
      
      setSubmissions(subData || []);
      console.log(`✅ Loaded ${subData?.length || 0} submissions.`);
      
      const initialDrafts: any = {};
      subData?.forEach((sub: any) => {  
        initialDrafts[sub.id] = {
          grade: sub.grade || "",
          feedback: sub.feedback || ""
        };
      });
      setDrafts(initialDrafts);

    } catch (err: any) {
      console.error("💥 Caught error in fetchSubmissions:", err);
      setError(err.message || "An error occurred while loading data from the database.");
    } finally {
      setIsLoading(false);
      console.log("🏁 fetchSubmissions() finished. Loader turned off.");
    }
  };

  // 3. Keep the streamlined effect array tracking assignmentId
  useEffect(() => {
    console.log("🔍 useEffect checked. Parsed integer ID:", assignmentId);
    
    if (!isNaN(assignmentId)) {
      fetchSubmissions();
    } else {
      console.error("🛑 Aborted fetch: assignmentId parsed as NaN.");
      setError("Invalid assignment identification format.");
      setIsLoading(false);
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
      
      if (assignment?.max_marks > 0 && !isNaN(Number(grade)) && Number(grade) > assignment.max_marks) {
        if (!confirm(`Warning: The grade entered (${grade}) exceeds the assignment's maximum marks (${assignment.max_marks}). Save anyway?`)) {
          setSavingId(null);
          return;
        }
      }

      const { error } = await (supabase.from('assignment_submissions') as any)
        .update({ grade, feedback })
        .eq('id', submissionId);

      if (error) throw error;
      
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

      <div className="flex justify-between items-end border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Student Submissions</h1>
          {assignment && <p className="text-slate-500 text-lg mt-1">{assignment.title}</p>}
        </div>
        {assignment && (
          <div className="bg-slate-100 px-4 py-2 rounded-lg border text-right">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Possible Marks</span>
            <span className="text-2xl font-bold text-slate-700">{assignment.max_marks || 0}</span>
          </div>
        )}
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
                  <TableHead>Grade / Marks</TableHead>
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
                      <div className="flex items-center gap-2">
                        <Input 
                          className="w-24 text-center font-semibold"
                          placeholder="Score"
                          value={drafts[sub.id]?.grade || ""} 
                          onChange={(e) => updateDraft(sub.id, 'grade', e.target.value)} 
                        />
                        <span className="text-sm font-medium text-slate-400">
                          / {assignment?.max_marks || 0}
                        </span>
                      </div>
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
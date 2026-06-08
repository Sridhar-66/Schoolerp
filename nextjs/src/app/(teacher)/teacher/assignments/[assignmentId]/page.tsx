"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

interface PageProps {
  params: Promise<{ assignmentId: string }>;
}

export default function AssignmentQuestionsPage({ params }: PageProps) {
  // Unwrap the params Promise using React's use() hook for Next.js 15 compatibility
  const resolvedParams = use(params);
  const assignmentId = parseInt(resolvedParams.assignmentId);

  const [assignment, setAssignment] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    question_text: "",
    question_type: "short", // 'short' or 'mcq'
    options: ["", "", "", ""],
    correct_answer: "",
    marks: 1
  });

  const supabase = createClient();

  const fetchQuestions = async () => {
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
      const { data: qData, error: qError } = await (supabase.from('assignment_questions') as any)
        .select('*')
        .eq('assignment_id', assignmentId)
        .order('created_at', { ascending: true });

      if (qError) throw qError;
      setQuestions(qData || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (assignmentId) {
      fetchQuestions();
    }
  }, [assignmentId]);

  const openDialog = (q: any = null) => {
    if (q) {
      setEditingId(q.id);
      setFormData({
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options || ["", "", "", ""],
        correct_answer: q.correct_answer || "",
        marks: q.marks
      });
    } else {
      setEditingId(null);
      setFormData({ question_text: "", question_type: "short", options: ["", "", "", ""], correct_answer: "", marks: 1 });
    }
    setIsDialogOpen(true);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const saveQuestion = async () => {
    try {
      setError(null);
      const payload = {
        assignment_id: assignmentId,
        question_text: formData.question_text,
        question_type: formData.question_type,
        options: formData.question_type === "mcq" ? formData.options : null,
        correct_answer: formData.correct_answer,
        marks: formData.marks
      };

      if (editingId) {
        const { error } = await (supabase.from('assignment_questions') as any)
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await (supabase.from('assignment_questions') as any)
          .insert([payload]);
        if (error) throw error;
      }

      setIsDialogOpen(false);
      fetchQuestions();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteQuestion = async (id: number) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      const { error } = await (supabase.from('assignment_questions') as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchQuestions();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 text-slate-500 mb-2">
        <Link href="/teacher/assignments" className="hover:underline">← Back to Assignments</Link>
      </div>
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Questions</h1>
          {assignment && <p className="text-slate-500 text-lg">{assignment.title}</p>}
        </div>
        <Button onClick={() => openDialog()}>Add Question</Button>
      </div>

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-4 text-slate-500">Loading questions...</div>
          ) : questions.length === 0 ? (
            <div className="text-center py-4 text-slate-500 italic">No questions added yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Answer</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((q) => (
                  <TableRow key={q.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium max-w-[300px] truncate">{q.question_text}</TableCell>
                    <TableCell className="uppercase text-xs font-semibold">{q.question_type}</TableCell>
                    <TableCell>{q.marks}</TableCell>
                    <TableCell className="text-green-600 font-medium truncate max-w-[200px]">{q.correct_answer || "-"}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="secondary" size="sm" onClick={() => openDialog(q)}>Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteQuestion(q.id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {/* Suppress accessible summary warnings by explicitly unsetting aria-describedby */}
        <DialogContent className="sm:max-w-[600px]" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Question" : "Add Question"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Question Text</label>
              <Textarea value={formData.question_text} onChange={e => setFormData({...formData, question_text: e.target.value})} placeholder="What is the capital of..." />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Question Type</label>
                <Select value={formData.question_type} onValueChange={v => setFormData({...formData, question_type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short Answer</SelectItem>
                    <SelectItem value="mcq">Multiple Choice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Marks</label>
                <Input type="number" min="1" value={formData.marks} onChange={e => setFormData({...formData, marks: parseInt(e.target.value) || 1})} />
              </div>
            </div>

            {formData.question_type === "mcq" && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-md border">
                <label className="text-sm font-medium">MCQ Options</label>
                {formData.options.map((opt, i) => (
                  <Input key={i} placeholder={`Option ${i + 1}`} value={opt} onChange={e => handleOptionChange(i, e.target.value)} />
                ))}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Correct Answer</label>
              <Input 
                value={formData.correct_answer} 
                onChange={e => setFormData({...formData, correct_answer: e.target.value})} 
                placeholder={formData.question_type === "mcq" ? "Type the correct option exactly" : "Expected answer snippet"} 
              />
            </div>

            <Button className="w-full mt-4" onClick={saveQuestion}>
              {editingId ? "Update Question" : "Save Question"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
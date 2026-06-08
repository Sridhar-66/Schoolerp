"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject_id: "",
    section_id: "",
    due_date: ""
  });

  const supabase = createClient();

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      // Teacher identity resolution is securely handled server-side via cookies/session middleware
      const res = await fetch("/api/teacher/assignments");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch assignments");
      setAssignments(json.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const { data: subData, error: subError } = await supabase
        .from('subjects')
        .select('id, name');
      
      if (subError) throw subError;
      setSubjects(subData || []);

      const { data: secData, error: secError } = await supabase
        .from('sections')
        .select('id, name');
        
      if (secError) throw secError;
      setSections(secData || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchAssignments();
    fetchDependencies();
  }, []);

  const openDialog = (assignment: any = null) => {
    if (assignment) {
      setEditingId(assignment.id);
      setFormData({
        title: assignment.title,
        description: assignment.description || "",
        subject_id: assignment.subject_id?.toString() || "",
        section_id: assignment.section_id?.toString() || "",
        due_date: assignment.due_date ? new Date(assignment.due_date).toISOString().slice(0, 16) : ""
      });
    } else {
      setEditingId(null);
      setFormData({ title: "", description: "", subject_id: "", section_id: "", due_date: "" });
    }
    setIsDialogOpen(true);
  };

  const saveAssignment = async () => {
    try {
      setError(null);
      
      if (!formData.title || !formData.due_date) {
        throw new Error("Title and Due Date are required fields.");
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        subject_id: formData.subject_id ? parseInt(formData.subject_id) : null,
        section_id: formData.section_id ? parseInt(formData.section_id) : null,
        due_date: new Date(formData.due_date).toISOString()
      };

      const url = "/api/teacher/assignments";
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? JSON.stringify({ id: editingId, ...payload }) : JSON.stringify(payload);

      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body });
      const json = await res.json();
      
      if (!res.ok) throw new Error(json.error || "Failed to process request");
      
      setIsDialogOpen(false);
      fetchAssignments();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteAssignment = async (id: number) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    try {
      const res = await fetch("/api/teacher/assignments", {
        method: "DELETE",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error);
      }
      fetchAssignments();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Assignments</h1>
        <Button onClick={() => openDialog()}>Create New Assignment</Button>
      </div>

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-slate-700">All Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-4 text-center text-slate-500">Loading assignments...</div>
          ) : assignments.length === 0 ? (
            <div className="p-4 text-center text-slate-500 italic">No assignments found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((a) => (
                  <TableRow key={a.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium">{a.title}</TableCell>
                    <TableCell>{a.subject?.name || "N/A"}</TableCell>
                    <TableCell>{a.section?.name || "N/A"}</TableCell>
                    <TableCell>{new Date(a.due_date).toLocaleString()}</TableCell>
                    <TableCell>{a.question_count || 0}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/teacher/assignments/${a.id}`}>Questions</Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/teacher/assignments/submissions/${a.id}`}>Submissions</Link>
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => openDialog(a)}>Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteAssignment(a.id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {/* aria-describedby={undefined} explicitly signals to Radix UI that no description string is required */}
        <DialogContent className="sm:max-w-[500px]" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Assignment" : "Create Assignment"}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Title</label>
              <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Midterm Essay" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Instructions..." />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Subject</label>
                <select 
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.subject_id} 
                  onChange={e => setFormData({...formData, subject_id: e.target.value})}
                >
                  <option value="">Select Subject</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id.toString()}>{s.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Section</label>
                <select 
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.section_id} 
                  onChange={e => setFormData({...formData, section_id: e.target.value})}
                >
                  <option value="">Select Section</option>
                  {sections.map(s => (
                    <option key={s.id} value={s.id.toString()}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Due Date</label>
              <Input type="datetime-local" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} />
            </div>
            
            <Button className="w-full mt-4" onClick={saveAssignment}>
              {editingId ? "Update Assignment" : "Save Assignment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
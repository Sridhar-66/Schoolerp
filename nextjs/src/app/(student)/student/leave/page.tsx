"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LeaveRequest {
  id: number;
  from_date: string;
  to_date: string;
  reason: string | null;
  status: string | null;
  created_at: string | null;
}

const inputStyle = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";
const textareaStyle = "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";

export default function LeavePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [isApplying, setIsApplying] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");

  async function fetchLeaveRecords(sId: number) {
    const { data, error: fetchError } = await supabase
      .from("leave_requests")
      .select("id, from_date, to_date, reason, status, created_at")
      .eq("student_id", sId)
      .order("from_date", { ascending: false });

    if (fetchError) {
      console.error("Fetch Leave Error:", fetchError);
      setError("Failed to load leave history.");
    } else {
      setLeaveRequests((data ?? []) as LeaveRequest[]);
    }
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("User session not found."); setLoading(false); return; }

      const { data: studentRaw, error: sErr } = await supabase
        .from("students").select("id").eq("profile_id", user.id).single();

      if (sErr || !studentRaw) { setError("Student profile not found."); setLoading(false); return; }

      const sid = (studentRaw as { id: number }).id;
      setStudentId(sid);
      await fetchLeaveRecords(sid);
      setLoading(false);
    };
    init();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !fromDate || !toDate || !reason.trim()) return;
    if (new Date(toDate) < new Date(fromDate)) {
      setError("To date cannot be before from date.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const { error: insertError } = await (supabase.from("leave_requests") as any)
      .insert({
        student_id: studentId,
        from_date: fromDate,
        to_date: toDate,
        reason: reason.trim(),
        status: "pending",
      });

    if (insertError) {
      console.error("Leave submit error:", insertError);
      setError("Failed to submit leave request.");
    } else {
      setFromDate(""); setToDate(""); setReason("");
      setIsApplying(false);
      await fetchLeaveRecords(studentId);
    }
    setSubmitting(false);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const statusBadge = (status: string | null) => {
    const s = status?.toLowerCase();
    if (s === "approved") return <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Approved</span>;
    if (s === "rejected") return <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Rejected</span>;
    return <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Pending</span>;
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading...</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Leave Requests</h1>
        {!isApplying && (
          <Button onClick={() => { setIsApplying(true); setError(null); }}>Apply for Leave</Button>
        )}
      </div>

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      {isApplying && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">New Leave Request</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">From Date</label>
                  <input type="date" className={inputStyle} value={fromDate} onChange={(e) => setFromDate(e.target.value)} required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">To Date</label>
                  <input type="date" className={inputStyle} value={toDate} onChange={(e) => setToDate(e.target.value)} required />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Reason</label>
                <textarea className={textareaStyle} rows={3} placeholder="Enter reason for leave..." value={reason} onChange={(e) => setReason(e.target.value)} required />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => { setIsApplying(false); setError(null); }} disabled={submitting}>Cancel</Button>
                <Button type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Submit"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Applied On</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaveRequests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No leave requests found.</TableCell>
            </TableRow>
          ) : (
            leaveRequests.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{formatDate(r.from_date)}</TableCell>
                <TableCell>{formatDate(r.to_date)}</TableCell>
                <TableCell className="text-muted-foreground max-w-xs">{r.reason ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{r.created_at ? formatDate(r.created_at) : "—"}</TableCell>
                <TableCell>{statusBadge(r.status)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
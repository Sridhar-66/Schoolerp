"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LeaveRequest {
  id: number;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
}

export default function LeavePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [isApplying, setIsApplying] = useState(false);

  // Form Field States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  // Consistent UI Form Styles
  const inputStyle = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  const textareaStyle = "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  async function fetchLeaveRecords(sId: number) {
    try {
      const { data, error: fetchError } = await supabase
        .from("leave_requests")
        .select("id, start_date, end_date, reason, status")
        .eq("student_id", sId)
        .order("start_date", { ascending: false });

      if (fetchError) throw fetchError;
      setLeaveRequests((data as LeaveRequest[]) || []);
    } catch (err: any) {
      console.error("Fetch Leave Error:", err);
      setError(err.message || "Failed to load leave history.");
    }
  }

  useEffect(() => {
    async function initializePage() {
      try {
        setLoading(true);

        // ⚠️ Critical Pattern Match: Student Identity Verification
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError("User session not found.");
          return;
        }

        const { data: studentRaw } = await supabase
          .from("students")
          .select("id")
          .eq("profile_id", user.id)
          .single();

        const student = studentRaw as { id: number } | null;
        if (!student) {
          setError("Student profile context missing.");
          return;
        }

        setStudentId(student.id);
        await fetchLeaveRecords(student.id);
      } catch (err: any) {
        console.error("Initialization Error:", err);
        setError(err.message || "An error occurred while loading context data.");
      } finally {
        setLoading(false);
      }
    }

    initializePage();
  }, []);

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) return;

    if (!startDate || !endDate || !reason.trim()) {
      alert("Please populate all date coordinates and specify a reason.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // 💡 Explicitly type-cast the table target to 'any' to defeat the generic 'never' payload restriction
      const { error: insertError } = await (supabase.from("leave_requests") as any)
        .insert([
          {
            student_id: studentId,
            start_date: startDate,
            end_date: endDate,
            reason: reason.trim(),
            status: "Pending",
          },
        ]);

      if (insertError) throw insertError;

      // Reset form controls and close frame
      setStartDate("");
      setEndDate("");
      setReason("");
      setIsApplying(false);

      // Re-fetch records to reflect live state additions
      await fetchLeaveRecords(studentId);
    } catch (err: any) {
      console.error("Submission Error:", err);
      setError(err.message || "Failed to process leave request application.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-muted-foreground animate-pulse font-medium">Synchronizing profile logs...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leave Requests</h1>
          <p className="text-muted-foreground mt-1">Submit new leave absences and monitor standard processing outcomes.</p>
        </div>
        {!isApplying && (
          <Button onClick={() => setIsApplying(true)} className="shadow-xs font-semibold">
            Apply for Leave
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Toggleable Request Application Form */}
      {isApplying && (
        <Card className="border bg-muted/10 shadow-sm animate-in fade-in-50 duration-200">
          <CardHeader className="border-b bg-background pb-3">
            <CardTitle className="text-base font-semibold">New Absence Application</CardTitle>
          </CardHeader>
          <CardContent className="p-4 bg-background">
            <form onSubmit={handleApplyLeave} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    From Date
                  </label>
                  <input
                    type="date"
                    className={inputStyle}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    To Date
                  </label>
                  <input
                    type="date"
                    className={inputStyle}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Detailed Reason for Leave
                </label>
                <textarea
                  className={textareaStyle}
                  rows={3}
                  placeholder="Provide specific notes regarding your scheduled context absence..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsApplying(false);
                    setError(null);
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Submitting Application..." : "Submit Application"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Main Records Log Matrix */}
      <div className="rounded-md border bg-background shadow-2xs">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="px-4 py-3 font-semibold text-foreground">From</TableHead>
              <TableHead className="px-4 py-3 font-semibold text-foreground">To</TableHead>
              <TableHead className="px-4 py-3 font-semibold text-foreground">Reason</TableHead>
              <TableHead className="px-4 py-3 font-semibold text-foreground">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaveRequests.length === 0 ? (
              <TableRow>
                <td colSpan={4} className="text-center text-muted-foreground py-10 font-medium">
                  No historical or active leave requests found.
                </td>
              </TableRow>
            ) : (
              leaveRequests.map((request) => (
                <TableRow key={request.id} className="hover:bg-muted/5 transition-colors align-top">
                  <td className="px-4 py-3.5 text-sm font-mono text-foreground whitespace-nowrap">
                    {formatDate(request.start_date)}
                  </td>
                  <td className="px-4 py-3.5 text-sm font-mono text-foreground whitespace-nowrap">
                    {formatDate(request.end_date)}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-muted-foreground max-w-md break-words leading-relaxed">
                    {request.reason}
                  </td>
                  <td className="px-4 py-3.5 align-middle">
                    {request.status?.toLowerCase() === "approved" ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                        Approved
                      </span>
                    ) : request.status?.toLowerCase() === "rejected" ? (
                      <span className="inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive border border-destructive/20">
                        Rejected
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                        Pending
                      </span>
                    )}
                  </td>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
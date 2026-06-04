"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { getFeeRecords, getFeeStructures, createFeeRecord, markAsPaid, FeePaymentRecord, FeeStructureItem } from "@/services/academic/fees";
import Link from "next/link";

export default function FeesTrackingLedger() {
  const [records, setRecords] = useState<FeePaymentRecord[]>([]);
  const [structures, setStructures] = useState<FeeStructureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actioningId, setActioningId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  const [studentName, setStudentName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [selectedStructureId, setSelectedStructureId] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [error, setError] = useState("");

  const loadLedgerData = async () => {
    try {
      setLoading(true);
      const [paymentsData, structuresData] = await Promise.all([getFeeRecords(), getFeeStructures()]);
      setRecords(paymentsData);
      setStructures(structuresData);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLedgerData(); }, []);

  const handleStructureChange = (id: string) => {
    setSelectedStructureId(id);
    const selected = structures.find(s => s.id === parseInt(id, 10));
    setCustomAmount(selected ? selected.amount.toString() : "");
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!studentName.trim()) return setError("Student name designation is required.");
    if (!rollNo.trim()) return setError("Student Roll Number reference is required.");
    if (!selectedStructureId) return setError("Please select a fee structure item allocation.");
    if (!customAmount || isNaN(Number(customAmount)) || Number(customAmount) <= 0) {
      return setError("Please provide a valid structural positive numerical amount.");
    }

    try {
      setSubmitting(true);
      await createFeeRecord(studentName.trim(), rollNo.trim().toUpperCase(), parseInt(selectedStructureId, 10), Number(customAmount));
      setStudentName("");
      setRollNo("");
      setSelectedStructureId("");
      setCustomAmount("");
      setOpen(false);
      await loadLedgerData();
    } catch (err: any) {
      setError(err.message || "Error printing invoice descriptor to ledger.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCollectCash = async (id: number) => {
    try {
      setActioningId(id);
      await markAsPaid(id);
      await loadLedgerData();
    } catch (err: any) {
      alert(err.message || "Failed to commit ledger adjustments.");
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase flex gap-2">
        <Link href="/admin/fees" className="hover:underline text-slate-400">Office Hub</Link>
        <span>/</span>
        <span className="text-slate-800">Payments Counter</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Collection Ledger Counter</h1>
          <p className="text-sm text-muted-foreground">Issue live student payment claims and execute real-time cash balance collections.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Record Cash Receipt</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Issue Student Fee Invoice</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateInvoice} className="flex flex-col gap-4 py-4">
              {error && <div className="text-xs text-red-500 bg-red-50 p-2 rounded border border-red-200">{error}</div>}

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Student Full Name</label>
                <Input placeholder="e.g., John Doe" value={studentName} onChange={(e) => setStudentName(e.target.value)} disabled={submitting} />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Roll Reference Identification ID</label>
                <Input placeholder="e.g., SEC-B-2024" value={rollNo} onChange={(e) => setRollNo(e.target.value)} disabled={submitting} />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Target Fee Schedule Allocation</label>
                <select value={selectedStructureId} onChange={(e) => handleStructureChange(e.target.value)} disabled={submitting} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="">Select billing bracket target...</option>
                  {structures.map((str) => <option key={str.id} value={str.id}>{str.name} (${Number(str.amount).toFixed(2)})</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Applied Amount Due Value ($)</label>
                <Input type="number" placeholder="0.00" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} disabled={submitting} />
              </div>

              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
                <Button type="submit" disabled={submitting}>{submitting ? "Processing Transaction..." : "Commit Invoice Balance"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Roll Reference</TableHead>
              <TableHead>Student Identity</TableHead>
              <TableHead>Assigned Allocation Profile</TableHead>
              <TableHead>Net Amount Owed</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status Code</TableHead>
              <TableHead className="text-right">Administrative Action Overrides</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-6 text-muted-foreground">Syncing transaction registry records...</TableCell></TableRow>
            ) : records.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-6 text-muted-foreground">No matching transaction instances found in database.</TableCell></TableRow>
            ) : (
              records.map((rec) => (
                <TableRow key={rec.id}>
                  <TableCell className="font-mono text-xs font-semibold text-slate-600">{rec.roll_no}</TableCell>
                  <TableCell className="font-medium">{rec.student_name}</TableCell>
                  <TableCell><span className="text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{rec.fees_structure?.name || "Standalone Invoice"}</span></TableCell>
                  <TableCell className="font-medium font-mono">${Number(rec.amount_paid).toFixed(2)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground uppercase">{rec.payment_method}</TableCell>
                  <TableCell><span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${rec.status === "Completed" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>{rec.status}</span></TableCell>
                  <TableCell className="text-right">
                    {rec.status === "Pending" ? (
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium" onClick={() => handleCollectCash(rec.id)} disabled={actioningId !== null}>
                        {actioningId === rec.id ? "Saving Cash..." : "Collect Cash"}
                      </Button>
                    ) : <span className="text-xs font-semibold text-slate-400 pr-3 select-none">Audited & Settled</span>}
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

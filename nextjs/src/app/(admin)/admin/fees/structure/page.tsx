"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { getFeeStructures, createFeeStructure, FeeStructureItem } from "@/services/academic/fees";
import Link from "next/link";

export default function FeeStructuresWindow() {
  const [structures, setStructures] = useState<FeeStructureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const [packageName, setPackageName] = useState("");
  const [packageAmount, setPackageAmount] = useState("");
  const [error, setError] = useState("");

  const syncView = async () => {
    try {
      setLoading(true);
      const data = await getFeeStructures();
      setStructures(data);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { syncView(); }, []);

  const handleSubmitRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!packageName.trim()) return setError("Please supply an identifier classification name.");
    if (!packageAmount || isNaN(Number(packageAmount)) || Number(packageAmount) <= 0) {
      return setError("Please provide a valid structural positive numerical cost specification.");
    }

    try {
      setSubmitting(true);
      await createFeeStructure(packageName.trim(), Number(packageAmount));
      setPackageName("");
      setPackageAmount("");
      setOpen(false);
      await syncView();
    } catch (err: any) {
      setError(err.message || "Error logging profile assignment code rules.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase flex gap-2">
        <Link href="/admin/fees" className="hover:underline text-slate-400">Office Hub</Link>
        <span>/</span>
        <span className="text-slate-800">Structure Rules</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fee Structure Allocation Settings</h1>
          <p className="text-sm text-muted-foreground">Manage school cost models mapped to transactional payment forms.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add New Bracket</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Declare Tuition/Fee Bracket</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitRule} className="flex flex-col gap-4 py-4">
              {error && <div className="text-xs text-red-500 bg-red-50 p-2 rounded border border-red-200">{error}</div>}

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Package Configuration Label Name</label>
                <Input placeholder="e.g., Grade 10 Full Tuition" value={packageName} onChange={(e) => setPackageName(e.target.value)} disabled={submitting} />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Fixed Monetary Amount Cost ($)</label>
                <Input type="number" placeholder="1500.00" value={packageAmount} onChange={(e) => setPackageAmount(e.target.value)} disabled={submitting} />
              </div>

              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
                <Button type="submit" disabled={submitting}>{submitting ? "Writing Rule..." : "Save Rule Definition"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Bracket Reference ID</TableHead>
              <TableHead>Allocation Description Label</TableHead>
              <TableHead className="text-right">Baseline Standard Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={3} className="text-center py-6 text-muted-foreground">Syncing structure schema details...</TableCell></TableRow>
            ) : structures.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center py-6 text-muted-foreground">No custom package templates defined yet.</TableCell></TableRow>
            ) : (
              structures.map((str) => (
                <TableRow key={str.id}>
                  <TableCell className="font-mono text-xs font-bold text-slate-500">#{str.id}</TableCell>
                  <TableCell className="font-medium text-slate-900">{str.name}</TableCell>
                  <TableCell className="text-right font-semibold font-mono text-slate-700">${Number(str.amount).toFixed(2)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

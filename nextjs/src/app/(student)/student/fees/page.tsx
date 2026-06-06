"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type FeePayment = {
  id: number;
  amount_paid: number;
  status: string;
  payment_method: string;
  paid_at: string | null;
  remarks: string | null;
  fees_structure: {
    name: string;
    amount: number;
    due_date: string | null;
  } | null;
};

export default function StudentFeesPage() {
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFees = async () => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: studentRaw } = await supabase
  .from("students")
  .select("id")
  .eq("profile_id", user.id)
  .single();

const student = studentRaw as { id: number } | null;
if (!student) return;

      const { data } = await supabase
        .from("fee_payments")
        .select(`
          id,
          amount_paid,
          status,
          payment_method,
          paid_at,
          remarks,
          fees_structure (
            name,
            amount,
            due_date
          )
        `)
        .eq("student_id", student.id)
        .order("paid_at", { ascending: false });

      if (data) setPayments(data as unknown as FeePayment[]);
      setLoading(false);
    };

    fetchFees();
  }, []);

  // Calculate totals
  const totalFee = payments.reduce(
    (sum, p) => sum + (p.fees_structure?.amount ?? 0),
    0
  );
  const totalPaid = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount_paid, 0);
  const totalPending = payments
    .filter((p) => p.status !== "paid")
    .reduce((sum, p) => sum + (p.fees_structure?.amount ?? 0), 0);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);

  const summaryCards = [
    { label: "Total", value: fmt(totalFee), color: "text-foreground" },
    { label: "Paid", value: fmt(totalPaid), color: "text-green-600" },
    { label: "Pending", value: fmt(totalPending), color: totalPending > 0 ? "text-red-500" : "text-green-600" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">My Fees</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {summaryCards.map((c) => (
          <Card key={c.label}>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                {c.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-3xl font-bold text-muted-foreground">—</p>
              ) : (
                <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment History Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fee Type</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Paid</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Paid On</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Remarks</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center text-muted-foreground py-8"
              >
                Loading...
              </TableCell>
            </TableRow>
          ) : payments.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center text-muted-foreground py-8"
              >
                No payment history.
              </TableCell>
            </TableRow>
          ) : (
            payments.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">
                  {p.fees_structure?.name ?? "—"}
                </TableCell>
                <TableCell>
                  {p.fees_structure?.due_date
                    ? new Date(p.fees_structure.due_date).toLocaleDateString(
                        "en-IN",
                        { day: "numeric", month: "short", year: "numeric" }
                      )
                    : "—"}
                </TableCell>
                <TableCell>{fmt(p.fees_structure?.amount ?? 0)}</TableCell>
                <TableCell>{fmt(p.amount_paid)}</TableCell>
                <TableCell className="capitalize">
                  {p.payment_method ?? "—"}
                </TableCell>
                <TableCell>
                  {p.paid_at
                    ? new Date(p.paid_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                      p.status === "paid"
                        ? "bg-green-100 text-green-700"
                        : p.status === "partial"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {p.status}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {p.remarks ?? "—"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
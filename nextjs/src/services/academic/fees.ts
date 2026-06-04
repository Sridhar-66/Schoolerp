"use server";

import { createServerAdminClient } from "@/lib/supabase/serverAdminClient";

export interface FeeStructureItem {
  id: number;
  name: string;
  amount: number;
}

export interface FeePaymentRecord {
  id: number;
  student_name: string;
  roll_no: string;
  amount_paid: number;
  status: string;
  payment_method: string;
  updated_at: string;
  fees_structure: {
    name: string;
  } | null;
}

export async function getFeeRecords(): Promise<FeePaymentRecord[]> {
  const supabase = createServerAdminClient();
  
  // Adding !fee_structure_id tells Supabase EXACTLY which foreign key column to follow
  const { data, error } = await (supabase as any)
    .from("fee_payments")
    .select("id, student_name, roll_no, amount_paid, status, payment_method, updated_at, fees_structure!fee_structure_id(name)")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(`Failed to read ledger records: ${error.message}`);
  return data || [];
}

export async function getFeeStructures(): Promise<FeeStructureItem[]> {
  const supabase = createServerAdminClient();
  const { data, error } = await (supabase as any)
    .from("fees_structure")
    .select("id, name, amount")
    .order("name", { ascending: true });

  if (error) throw new Error(`Failed to read fee structures: ${error.message}`);
  return data || [];
}

export async function createFeeStructure(name: string, amount: number) {
  const supabase = createServerAdminClient();
  const { data, error } = await (supabase as any)
    .from("fees_structure")
    .insert({ name, amount })
    .select()
    .single();

  if (error) throw new Error(`Failed to declare new structural rate: ${error.message}`);
  return data;
}

export async function createFeeRecord(studentName: string, rollNo: string, structureId: number, amount: number) {
  const supabase = createServerAdminClient();
  const { data, error } = await (supabase as any)
    .from("fee_payments")
    .insert({
      student_name: studentName,
      roll_no: rollNo,
      fee_structure_id: structureId,
      amount_paid: amount,
      status: "Pending",
      payment_method: "Cash"
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to execute payment log entry: ${error.message}`);
  return data;
}

export async function markAsPaid(paymentId: number) {
  const supabase = createServerAdminClient();
  const { data, error } = await (supabase as any)
    .from("fee_payments")
    .update({ status: "Completed", updated_at: new Date().toISOString() })
    .eq("id", paymentId)
    .select()
    .single();

  if (error) throw new Error(`Failed to confirm cash processing settlement: ${error.message}`);
  return data;
}

import Link from "next/link";
import { getFeeRecords, getFeeStructures } from "@/services/academic/fees";

export const revalidate = 0;

export default async function FeesMasterPage() {
  let paymentCount = 0;
  let structureCount = 0;
  let missingBalance = 0;

  try {
    const [payments, structures] = await Promise.all([getFeeRecords(), getFeeStructures()]);
    paymentCount = payments.length;
    structureCount = structures.length;
    missingBalance = payments
      .filter(p => p.status === "Pending")
      .reduce((acc, curr) => acc + Number(curr.amount_paid), 0);
  } catch (err) {
    console.error("Dashboard calculation anomaly:", err);
  }

  return (
    <div className="p-6 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financial Office Management</h1>
        <p className="text-muted-foreground text-sm">Select a functional route configuration panel to audit accounts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-xl p-5 bg-white shadow-sm">
          <p className="text-xs text-muted-foreground font-semibold uppercase">Pending Outstanding Liquidity</p>
          <p className="text-2xl font-bold mt-2 text-amber-600">${missingBalance.toFixed(2)}</p>
        </div>
        <div className="border rounded-xl p-5 bg-white shadow-sm">
          <p className="text-xs text-muted-foreground font-semibold uppercase">Total Ledgers Handled</p>
          <p className="text-2xl font-bold mt-2">{paymentCount} Records</p>
        </div>
        <div className="border rounded-xl p-5 bg-white shadow-sm">
          <p className="text-xs text-muted-foreground font-semibold uppercase">Active Structural Packages</p>
          <p className="text-2xl font-bold mt-2">{structureCount} Rules Defined</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-xl p-6 bg-white shadow-sm flex flex-col justify-between items-start gap-4">
          <div>
            <h3 className="text-lg font-bold">1. Fee Allocation Brackets</h3>
            <p className="text-sm text-muted-foreground mt-1">Configure pricing schedules, operational rules, tuition fees matrix setups, and custom packages assigned to incoming metrics.</p>
          </div>
          <Link href="/admin/fees/structure" className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors">
            Configure Rules & Pricing
          </Link>
        </div>

        <div className="border rounded-xl p-6 bg-white shadow-sm flex flex-col justify-between items-start gap-4">
          <div>
            <h3 className="text-lg font-bold">2. Transaction Collection Counter</h3>
            <p className="text-sm text-muted-foreground mt-1">Accept student cash collection assets, generate dynamic invoices, verify tracking references, and perform cash-desk settle balance workflows.</p>
          </div>
          <Link href="/admin/fees/payments" className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors">
            Open Ledger & Cash Counter
          </Link>
        </div>
      </div>
    </div>
  );
}

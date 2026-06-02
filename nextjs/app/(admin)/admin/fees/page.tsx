import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function FeesPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Fees</h1>
      <div className="grid grid-cols-2 gap-4">
        <Card><CardHeader><CardTitle className="text-sm">Total Collected</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">—</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Pending</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">—</p></CardContent></Card>
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Amount</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
        <TableBody><TableRow><td colSpan={4} className="text-center text-muted-foreground py-6">No records found.</td></TableRow></TableBody>
      </Table>
    </div>
  )
}

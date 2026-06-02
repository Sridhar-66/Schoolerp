import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function StudentFeesPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">My Fees</h1>
      <div className="grid grid-cols-3 gap-4">
        {["Total", "Paid", "Pending"].map(l => <Card key={l}><CardHeader><CardTitle className="text-sm">{l}</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">—</p></CardContent></Card>)}
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>Fee Type</TableHead><TableHead>Amount</TableHead><TableHead>Paid On</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
        <TableBody><TableRow><td colSpan={4} className="text-center text-muted-foreground py-6">No payment history.</td></TableRow></TableBody>
      </Table>
    </div>
  )
}

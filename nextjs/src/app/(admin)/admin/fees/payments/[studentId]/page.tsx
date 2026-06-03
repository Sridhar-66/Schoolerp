import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function StudentFeeDetailPage({ params }: { params: { studentId: string } }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Fee Detail � Student {params.studentId}</h1>
      <Table>
        <TableHeader><TableRow><TableHead>Fee Type</TableHead><TableHead>Amount</TableHead><TableHead>Paid On</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
        <TableBody><TableRow><td colSpan={4} className="text-center text-muted-foreground py-6">No payment history.</td></TableRow></TableBody>
      </Table>
    </div>
  )
}

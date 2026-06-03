import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ClassDetailPage({ params }: { params: { classId: string } }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Class Detail � {params.classId}</h1>
      <Table>
        <TableHeader><TableRow><TableHead>Section</TableHead><TableHead>Students</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
        <TableBody><TableRow><td colSpan={3} className="text-center text-muted-foreground py-6">No sections found.</td></TableRow></TableBody>
      </Table>
    </div>
  )
}

import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function StudentAssignmentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">My Assignments</h1>
      <Table>
        <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Subject</TableHead><TableHead>Due Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
        <TableBody><TableRow><td colSpan={4} className="text-center text-muted-foreground py-6">No assignments.</td></TableRow></TableBody>
      </Table>
    </div>
  )
}


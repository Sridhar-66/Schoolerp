import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function SubmissionsPage({ params }: { params: { assignmentId: string } }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Submissions � Assignment {params.assignmentId}</h1>
      <Table>
        <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Submitted On</TableHead><TableHead>File</TableHead><TableHead>Grade</TableHead></TableRow></TableHeader>
        <TableBody><TableRow><td colSpan={4} className="text-center text-muted-foreground py-6">No submissions yet.</td></TableRow></TableBody>
      </Table>
    </div>
  )
}

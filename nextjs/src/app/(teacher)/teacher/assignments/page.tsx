import { Button } from "@/components/ui/button"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function TeacherAssignmentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Assignments</h1>
        <Button>Create Assignment</Button>
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Class</TableHead><TableHead>Due Date</TableHead><TableHead>Submissions</TableHead></TableRow></TableHeader>
        <TableBody><TableRow><td colSpan={4} className="text-center text-muted-foreground py-6">No assignments yet.</td></TableRow></TableBody>
      </Table>
    </div>
  )
}


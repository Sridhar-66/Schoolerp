import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ExamResultsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Exam Results</h1>
      <Select><SelectTrigger className="w-48"><SelectValue placeholder="Select exam" /></SelectTrigger><SelectContent><SelectItem value="none">No exams yet</SelectItem></SelectContent></Select>
      <Table>
        <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Marks</TableHead><TableHead>Grade</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
        <TableBody><TableRow><td colSpan={4} className="text-center text-muted-foreground py-6">No records found.</td></TableRow></TableBody>
      </Table>
    </div>
  )
}

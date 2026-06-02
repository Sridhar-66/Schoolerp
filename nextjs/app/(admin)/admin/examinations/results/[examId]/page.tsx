import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ExamResultDetailPage({ params }: { params: { examId: string } }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Results — Exam {params.examId}</h1>
      <Table>
        <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Marks</TableHead><TableHead>Grade</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
        <TableBody><TableRow><td colSpan={4} className="text-center text-muted-foreground py-6">No records found.</td></TableRow></TableBody>
      </Table>
    </div>
  )
}

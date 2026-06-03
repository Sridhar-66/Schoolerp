import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ExamResultPage({ params }: { params: { examId: string } }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Result � Exam {params.examId}</h1>
      <Table>
        <TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>Marks</TableHead><TableHead>Grade</TableHead></TableRow></TableHeader>
        <TableBody><TableRow><td colSpan={3} className="text-center text-muted-foreground py-6">No data.</td></TableRow></TableBody>
      </Table>
    </div>
  )
}

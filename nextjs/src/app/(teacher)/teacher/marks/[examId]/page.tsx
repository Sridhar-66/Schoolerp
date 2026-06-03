import { Input } from "@/components/ui/input"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ExamMarksPage({ params }: { params: { examId: string } }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Enter Marks � Exam {params.examId}</h1>
      <Table>
        <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Marks</TableHead></TableRow></TableHeader>
        <TableBody><TableRow><td className="py-4 text-muted-foreground">No students.</td><td><Input disabled placeholder="�" className="w-24" /></td></TableRow></TableBody>
      </Table>
    </div>
  )
}

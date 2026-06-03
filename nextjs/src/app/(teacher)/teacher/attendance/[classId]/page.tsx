import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function TeacherClassAttendancePage({ params }: { params: { classId: string } }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Attendance � Class {params.classId}</h1>
      <Input type="date" className="max-w-xs" />
      <Table>
        <TableHeader><TableRow><TableHead>Roll No</TableHead><TableHead>Name</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
        <TableBody><TableRow><td colSpan={2} className="py-4 text-muted-foreground">No students found.</td><td><Button variant="outline" size="sm" disabled>Present</Button></td></TableRow></TableBody>
      </Table>
    </div>
  )
}

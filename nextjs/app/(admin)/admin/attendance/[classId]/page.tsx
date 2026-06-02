import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"

export default function ClassAttendancePage({ params }: { params: { classId: string } }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Attendance — Class {params.classId}</h1>
      <Input type="date" className="max-w-xs" />
      <Table>
        <TableHeader><TableRow><TableHead>Roll No</TableHead><TableHead>Name</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
        <TableBody><TableRow><td colSpan={3} className="text-center text-muted-foreground py-6">No records found.</td></TableRow></TableBody>
      </Table>
    </div>
  )
}

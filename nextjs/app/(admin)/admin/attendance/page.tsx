import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function AttendancePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Attendance</h1>
      <div className="flex gap-4">
        <Select><SelectTrigger className="w-48"><SelectValue placeholder="Select class" /></SelectTrigger><SelectContent><SelectItem value="none">No classes</SelectItem></SelectContent></Select>
        <Select><SelectTrigger className="w-48"><SelectValue placeholder="Select date" /></SelectTrigger><SelectContent><SelectItem value="none">No dates</SelectItem></SelectContent></Select>
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>Roll No</TableHead><TableHead>Name</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
        <TableBody><TableRow><td colSpan={3} className="text-center text-muted-foreground py-6">No records found.</td></TableRow></TableBody>
      </Table>
    </div>
  )
}

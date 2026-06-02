import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function StudentAttendancePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">My Attendance</h1>
      <Card>
        <CardHeader><CardTitle>Monthly Summary</CardTitle></CardHeader>
        <CardContent className="flex gap-8 text-muted-foreground"><p>Present: —</p><p>Absent: —</p><p>Total: —</p></CardContent>
      </Card>
      <Table>
        <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Subject</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
        <TableBody><TableRow><td colSpan={3} className="text-center text-muted-foreground py-6">No records found.</td></TableRow></TableBody>
      </Table>
    </div>
  )
}

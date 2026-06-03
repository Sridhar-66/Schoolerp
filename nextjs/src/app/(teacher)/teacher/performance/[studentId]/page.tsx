import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function StudentPerformancePage({ params }: { params: { studentId: string } }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Performance � Student {params.studentId}</h1>
      <div className="grid grid-cols-2 gap-4">
        <Card><CardHeader><CardTitle className="text-sm">Attendance %</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">�</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Average Marks</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">�</p></CardContent></Card>
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>Marks</TableHead><TableHead>Grade</TableHead></TableRow></TableHeader>
        <TableBody><TableRow><td colSpan={3} className="text-center text-muted-foreground py-6">No data.</td></TableRow></TableBody>
      </Table>
    </div>
  )
}

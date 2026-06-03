import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function TeacherDetailPage({ params }: { params: { teacherId: string } }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Teacher Profile</h1>
      <Card><CardHeader><CardTitle>Details</CardTitle></CardHeader><CardContent className="flex flex-col gap-2 text-muted-foreground"><p>Name: �</p><p>Email: �</p><p>Subject: �</p></CardContent></Card>
      <Table>
        <TableHeader><TableRow><TableHead>Class</TableHead><TableHead>Section</TableHead><TableHead>Subject</TableHead></TableRow></TableHeader>
        <TableBody><TableRow><td colSpan={3} className="text-center text-muted-foreground py-6">No classes assigned.</td></TableRow></TableBody>
      </Table>
    </div>
  )
}

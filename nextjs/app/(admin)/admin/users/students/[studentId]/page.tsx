import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function StudentDetailPage({ params }: { params: { studentId: string } }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Student Profile</h1>
      <Card><CardHeader><CardTitle>Details</CardTitle></CardHeader><CardContent className="flex flex-col gap-2 text-muted-foreground"><p>Name: —</p><p>Class: —</p><p>Roll No: —</p></CardContent></Card>
      <Card><CardHeader><CardTitle>Attendance Summary</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">No attendance data.</p></CardContent></Card>
    </div>
  )
}

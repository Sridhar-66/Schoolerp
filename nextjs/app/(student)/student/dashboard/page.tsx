import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const stats = ["Attendance %", "Pending Assignments", "Next Exam"]

export default function StudentDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Student Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        {stats.map(s => <Card key={s}><CardHeader><CardTitle className="text-sm">{s}</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">—</p></CardContent></Card>)}
      </div>
      <Card><CardHeader><CardTitle>Announcements</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">No announcements.</p></CardContent></Card>
    </div>
  )
}

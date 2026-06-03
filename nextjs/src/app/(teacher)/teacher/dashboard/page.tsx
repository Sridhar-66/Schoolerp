import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const stats = ["My Classes", "Today s Attendance", "Pending Evaluations"]

export default function TeacherDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        {stats.map(s => <Card key={s}><CardHeader><CardTitle className="text-sm">{s}</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">—</p></CardContent></Card>)}
      </div>
      <Card><CardHeader><CardTitle>Today s Schedule</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">No schedule available.</p></CardContent></Card>
    </div>
  )
}


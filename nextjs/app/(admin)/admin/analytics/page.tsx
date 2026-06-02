import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const charts = ["Student Enrollment", "Attendance Overview", "Fee Collection", "Exam Performance"]

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <div className="grid grid-cols-2 gap-4">
        {charts.map(c => (
          <Card key={c}>
            <CardHeader><CardTitle className="text-sm">{c}</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground text-sm">No data yet.</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

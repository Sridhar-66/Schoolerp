import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const stats = ["Total Students", "Total Teachers", "Classes", "Pending Fees"]

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s}>
            <CardHeader><CardTitle className="text-sm">{s}</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">—</p></CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground text-sm">No recent activity.</p></CardContent>
      </Card>
    </div>
  )
}

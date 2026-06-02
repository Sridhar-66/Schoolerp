import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PerformancePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Student Performance</h1>
      <Select><SelectTrigger className="w-48"><SelectValue placeholder="Select student" /></SelectTrigger><SelectContent><SelectItem value="none">No students</SelectItem></SelectContent></Select>
      <Card><CardHeader><CardTitle>Performance Overview</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Select a student to view performance.</p></CardContent></Card>
    </div>
  )
}

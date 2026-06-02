import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function StudentAnnouncementsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Announcements</h1>
      <Card><CardHeader><CardTitle>No Announcements</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">No announcements yet.</p></CardContent></Card>
    </div>
  )
}

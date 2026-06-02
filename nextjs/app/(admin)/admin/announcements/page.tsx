import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AnnouncementsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Announcements</h1>
        <Button>New Announcement</Button>
      </div>
      <Card><CardHeader><CardTitle>No Announcements</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">No announcements yet.</p></CardContent></Card>
    </div>
  )
}

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CalendarPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Academic Calendar</h1>
        <Button>Add Event</Button>
      </div>
      <Card><CardHeader><CardTitle>Calendar</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">No events added.</p></CardContent></Card>
    </div>
  )
}


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function StudentMessagesPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Messages</h1>
      <Card><CardHeader><CardTitle>Inbox</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">No messages yet.</p></CardContent></Card>
    </div>
  )
}


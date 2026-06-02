import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function StudentThreadPage({ params }: { params: { threadId: string } }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Thread {params.threadId}</h1>
      <Card><CardHeader><CardTitle>Messages</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">No messages in this thread.</p></CardContent></Card>
      <div className="flex gap-2"><Input disabled placeholder="Reply..." /><Button disabled>Send</Button></div>
    </div>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ParentDetailPage({ params }: { params: { parentId: string } }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Parent Profile</h1>
      <Card><CardHeader><CardTitle>Details</CardTitle></CardHeader><CardContent className="flex flex-col gap-2 text-muted-foreground"><p>Name: �</p><p>Email: �</p></CardContent></Card>
      <Card><CardHeader><CardTitle>Linked Student</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">No student linked.</p></CardContent></Card>
    </div>
  )
}

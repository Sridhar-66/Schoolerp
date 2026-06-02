import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AssignmentDetailPage({ params }: { params: { assignmentId: string } }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Assignment Detail</h1>
      <Card>
        <CardHeader><CardTitle>Assignment {params.assignmentId}</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-2 text-muted-foreground"><p>Title: —</p><p>Class: —</p><p>Due Date: —</p><p>Description: —</p></CardContent>
      </Card>
    </div>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function StudentAssignmentDetailPage({ params }: { params: { assignmentId: string } }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Assignment Detail</h1>
      <Card><CardHeader><CardTitle>Assignment {params.assignmentId}</CardTitle></CardHeader><CardContent className="flex flex-col gap-2 text-muted-foreground"><p>Title: �</p><p>Subject: �</p><p>Due Date: �</p><p>Description: �</p></CardContent></Card>
      <div className="border-2 border-dashed rounded p-8 text-center text-muted-foreground">Drop file here to upload</div>
      <Button disabled>Submit Assignment</Button>
    </div>
  )
}

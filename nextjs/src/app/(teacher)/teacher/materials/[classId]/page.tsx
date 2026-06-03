import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ClassMaterialsPage({ params }: { params: { classId: string } }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Materials � Class {params.classId}</h1>
      <Card><CardHeader><CardTitle>No Materials</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">No materials uploaded for this class.</p></CardContent></Card>
    </div>
  )
}

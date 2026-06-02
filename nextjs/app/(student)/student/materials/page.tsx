import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function StudentMaterialsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Study Materials</h1>
      <Select><SelectTrigger className="w-48"><SelectValue placeholder="Select subject" /></SelectTrigger><SelectContent><SelectItem value="none">No subjects</SelectItem></SelectContent></Select>
      <p className="text-muted-foreground">No materials available.</p>
    </div>
  )
}

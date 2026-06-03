import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ReportCardsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Report Cards</h1>
      <div className="flex gap-4">
        <Select><SelectTrigger className="w-48"><SelectValue placeholder="Select class" /></SelectTrigger><SelectContent><SelectItem value="none">No classes</SelectItem></SelectContent></Select>
        <Select><SelectTrigger className="w-48"><SelectValue placeholder="Select exam" /></SelectTrigger><SelectContent><SelectItem value="none">No exams</SelectItem></SelectContent></Select>
      </div>
      <p className="text-muted-foreground">No students found.</p>
    </div>
  )
}


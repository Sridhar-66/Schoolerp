import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function TimetablePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Timetable</h1>
      <Select><SelectTrigger className="w-48"><SelectValue placeholder="Select class" /></SelectTrigger><SelectContent><SelectItem value="none">No classes yet</SelectItem></SelectContent></Select>
      <p className="text-muted-foreground">Select a class to view timetable.</p>
    </div>
  )
}


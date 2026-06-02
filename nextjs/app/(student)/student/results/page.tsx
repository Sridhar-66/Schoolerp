import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function StudentResultsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">My Results</h1>
      <Select><SelectTrigger className="w-48"><SelectValue placeholder="Select exam" /></SelectTrigger><SelectContent><SelectItem value="none">No exams</SelectItem></SelectContent></Select>
      <Table>
        <TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>Marks</TableHead><TableHead>Grade</TableHead></TableRow></TableHeader>
        <TableBody><TableRow><td colSpan={3} className="text-center text-muted-foreground py-6">No results found.</td></TableRow></TableBody>
      </Table>
    </div>
  )
}

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ExaminationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Examinations</h1>
        <Button>Create Exam</Button>
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>Exam Name</TableHead><TableHead>Class</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
        <TableBody><TableRow><td colSpan={4} className="text-center text-muted-foreground py-6">No records found.</td></TableRow></TableBody>
      </Table>
    </div>
  )
}


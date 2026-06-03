import { Button } from "@/components/ui/button"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function AcademicYearsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Academic Years</h1>
        <Button>Add Year</Button>
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>Year</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
        <TableBody><TableRow><td colSpan={3} className="text-center text-muted-foreground py-6">No records found.</td></TableRow></TableBody>
      </Table>
    </div>
  )
}


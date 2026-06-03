import { Button } from "@/components/ui/button"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function GradingPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Grading Policy</h1>
        <Button>Add Grade</Button>
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>Grade</TableHead><TableHead>Min Marks</TableHead><TableHead>Max Marks</TableHead></TableRow></TableHeader>
        <TableBody><TableRow><td colSpan={3} className="text-center text-muted-foreground py-6">No grades defined.</td></TableRow></TableBody>
      </Table>
    </div>
  )
}


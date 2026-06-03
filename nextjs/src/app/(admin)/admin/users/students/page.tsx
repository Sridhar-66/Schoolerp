"use client"; // 1. Turn this into a client component so onClick works

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { admitStudent } from "@/services/students/admitStudent" // 2. Import your server action

export default function StudentsPage() {
  
  // 3. Create the handler to fire when the button is clicked
  async function handleAdmitStudent() {
    console.log("🔥 ADD STUDENT BUTTON CLICKED 🔥");

    try {
      const result = await admitStudent();
      console.log("SUCCESS ON CLIENT:", result);
      alert("SUCCESS: Check your database profile table!");
    } catch (err) {
      console.error("CATCHING ERROR ON CLIENT:");
      console.error(err);
      alert("ERROR: Check your code terminal");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Students</h1>
        {/* 4. Attach the click handler here */}
        <Button onClick={handleAdmitStudent}>Add Student</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Roll No</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <td colSpan={4} className="text-center text-muted-foreground py-6">
              No records found.
            </td>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
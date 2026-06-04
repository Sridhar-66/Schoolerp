"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function TeachersPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Teachers Directory</h1>
        <Button asChild>
          <Link href="/admin/users/teachers/add">Add Teacher</Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <td colSpan={4} className="text-center text-muted-foreground py-6">
              No teacher records pulled yet.
            </td>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
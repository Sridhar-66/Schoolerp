"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getClassDetails } from "@/services/academic/classes";

interface SectionWithCount {
  id: number;
  name: string;
  student_count: number;
}

interface ClassDetailState {
  name: string;
  sections: SectionWithCount[];
}

export default function ClassDetailPage({ params }: { params: any }) {
  const [data, setData] = useState<ClassDetailState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Unwrapping params safely to support both synchronous and asynchronous Next.js routing patterns
        const resolvedParams = await params;
        const id = parseInt(resolvedParams.classId, 10);
        
        if (isNaN(id)) {
          setError("Invalid structural Class identifier URL parameter.");
          return;
        }

        const classDetails = await getClassDetails(id);
        setData(classDetails);
      } catch (err: any) {
        setError(err.message || "Failed parsing operational dashboard logs.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params]);

  return (
    <div className="flex flex-col gap-6">
      
      {/* Navigation and Top Header Row */}
      <div className="flex flex-col gap-2">
        <Link href="/admin/academic/classes" className="text-sm text-muted-foreground hover:text-primary transition-colors w-fit">
          ← Back to Classes List
        </Link>
        <div className="flex items-center justify-between mt-1">
          <h1 className="text-2xl font-bold">
            {loading ? "Loading Class Details..." : `Class Detail: ${data?.name}`}
          </h1>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-500 bg-red-50 p-3 rounded border border-red-200">
          {error}
        </div>
      )}

      {/* Structured Sections Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Section Name</TableHead>
            <TableHead>Enrolled Students</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                Syncing system profile maps...
              </TableCell>
            </TableRow>
          ) : !data || data.sections.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                No active sections currently mapped to this class framework.
              </TableCell>
            </TableRow>
          ) : (
            data.sections.map((sec) => (
              <TableRow key={sec.id}>
                <TableCell className="font-medium">Section {sec.name}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-800">
                    {sec.student_count} {sec.student_count === 1 ? "student" : "students"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {/* Future extension spot: view roster or manage scheduling */}
                  <Button variant="outline" size="sm" disabled>
                    Manage Roster
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
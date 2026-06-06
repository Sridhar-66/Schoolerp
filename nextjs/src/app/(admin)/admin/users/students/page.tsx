"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/client";

type Student = {
  id: number;
  roll_number: string | null;
  student_type: string;
  profile_id: string | null;
  class_id: number | null;
  section_id: number | null;
  profiles: any; 
  classes: any;
  sections: any;
};

type Class = { id: number; name: string };

const selectDropdownStyle =
  "h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");

  // Failsafe extractor to process structural array vs flat object conversions safely
  const extractNestedData = (relation: any, key: string): string | null => {
    if (!relation) return null;
    if (Array.isArray(relation)) {
      return relation[0]?.[key] ?? null;
    }
    return relation[key] ?? null;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient();

        const [{ data: studentData }, { data: classData }] = await Promise.all([
          supabase
            .from("students")
            .select(`
              id,
              roll_number,
              student_type,
              profile_id,
              class_id,
              section_id,
              profiles ( full_name, phone ),
              classes ( name ),
              sections ( name )
            `)
            .order("id"),
          supabase
            .from("classes")
            .select("id, name")
            .order("name"),
        ]);

        if (studentData) setStudents(studentData as unknown as Student[]);
        if (classData) setClasses(classData as Class[]);
      } catch (error) {
        console.error("Critical error loading administrative dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredStudents = students.filter((student) => {
    const rawFullName = extractNestedData(student.profiles, "full_name") ?? "";
    const nameMatch = rawFullName.toLowerCase().includes(search.toLowerCase());
    const rollMatch = (student.roll_number ?? "").toLowerCase().includes(search.toLowerCase());
    
    const matchesSearch = search === "" || nameMatch || rollMatch;
    const matchesClass = classFilter === "" || String(student.class_id) === classFilter;
    
    return matchesSearch && matchesClass;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Students Matrix</h1>
        <Button asChild>
          <Link href="/admin/users/students/add">Add Student</Link>
        </Button>
      </div>

      {/* Filters Control Engine */}
      <div className="flex gap-3 flex-wrap">
        <Input
          placeholder="Search by name or roll number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <select
          className={selectDropdownStyle}
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
        >
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Enterprise Data Grid Matrix */}
      <div className="rounded-md border bg-background shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Roll No</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-12 font-medium animate-pulse">
                  Decrypting relational database stream...
                </TableCell>
              </TableRow>
            ) : filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-12 font-medium">
                  No active student profiles match query criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => {
                const studentName = extractNestedData(student.profiles, "full_name");
                const className = extractNestedData(student.classes, "name");
                const sectionName = extractNestedData(student.sections, "name");
                const phoneNo = extractNestedData(student.profiles, "phone");

                return (
                  <TableRow key={student.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-semibold text-foreground">
                      {studentName || <span className="text-destructive/60 font-normal">No Link to Profile</span>}
                    </TableCell>
                    <TableCell>{className || <span className="text-muted-foreground/50">Unassigned</span>}</TableCell>
                    <TableCell>{sectionName || <span className="text-muted-foreground/50">Unassigned</span>}</TableCell>
                    <TableCell className="font-mono text-sm">{student.roll_number ?? "—"}</TableCell>
                    <TableCell className="capitalize text-xs font-semibold">
                      {student.student_type || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{phoneNo ?? "—"}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild className="font-medium shadow-2xs">
                        <Link href={`/admin/users/students/${student.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && (
        <p className="text-xs text-muted-foreground font-medium">
          Dashboard Context: Processing {filteredStudents.length} of {students.length} total records.
        </p>
      )}
    </div>
  );
}
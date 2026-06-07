"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface ClassType {
  id: number
  name: string
}

interface StudentType {
  id: number
  roll_number: string
  class_id: number
  profiles?: {
    full_name: string
  }
  report_cards?: {
    is_published: boolean
  }[]
}

export default function ReportCardsDashboard() {
  const supabase = createClient()
  const [classes, setClasses] = useState<ClassType[]>([])
  const [students, setStudents] = useState<StudentType[]>([])
  const [selectedClassId, setSelectedClassId] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    async function fetchClasses() {
      const { data, error } = await (supabase
        .from("classes")
        .select("id, name")
        .order("name", { ascending: true }) as any)

      if (error) {
        console.error("Error fetching classes:", error.message)
      } else if (data) {
        setClasses(data)
        if (data.length > 0) {
          setSelectedClassId(data[0].id.toString()) 
        }
      }
    }
    fetchClasses()
  }, [])

  useEffect(() => {
    if (!selectedClassId) return

    async function fetchStudentsByClass() {
      setLoading(true)
      // Requesting the exact 'full_name' column from profiles
      const { data, error } = await (supabase
        .from("students")
        .select(`
          id, 
          roll_number, 
          class_id,
          profiles ( full_name ),
          report_cards ( is_published )
        `)
        .eq("class_id", parseInt(selectedClassId)) as any)

      if (error) {
        console.error("Error fetching students:", error.message)
      } else if (data) {
        setStudents(data as unknown as StudentType[])
      }
      setLoading(false)
    }

    fetchStudentsByClass()
  }, [selectedClassId])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Report Cards</h1>
        <p className="text-sm text-muted-foreground">Manage, review, and publish student academic performance reviews dynamically.</p>
      </div>

      <div className="flex items-center gap-4 bg-muted/40 p-4 rounded-lg border">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Filter by Class Course</label>
          <select 
            value={selectedClassId} 
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="flex h-9 w-64 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-md border bg-background overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading active student roster...</div>
        ) : students.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No students enrolled in this course stream yet.</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-xs font-medium text-muted-foreground border-b">
              <tr>
                <th className="p-4">Roll No</th>
                <th className="p-4">Student Name</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.map((student) => {
                const isPublished = student.report_cards?.[0]?.is_published ?? false
                // Accessing full_name here
                const studentName = student.profiles?.full_name || "Unknown Student"
                
                return (
                  <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-mono font-medium">{student.roll_number || "N/A"}</td>
                    <td className="p-4 font-medium">{studentName}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                        isPublished 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link 
                        href={`/admin/report-cards/${student.id}`}
                        className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium shadow transition-colors hover:bg-primary/90"
                      >
                        View & Edit
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
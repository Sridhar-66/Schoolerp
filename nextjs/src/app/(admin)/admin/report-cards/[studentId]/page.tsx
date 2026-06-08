"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { computeGrade } from "@/services/academic/results-helpers"

interface GradeRow {
  subject_name: string
  marks_obtained: number
  max_marks: number
  grade: string
}

interface StudentProfile {
  name: string
  roll_number: string
  class_name: string
}

export default function StudentReportCardPage({ params }: { params: Promise<{ studentId: string }> }) {
  const resolvedParams = use(params)
  const supabase = createClient()
  const numericStudentId = parseInt(resolvedParams.studentId)

  const [student, setStudent] = useState<StudentProfile | null>(null)
  const [grades, setGrades] = useState<GradeRow[]>([])
  const [remarks, setRemarks] = useState<string>("")
  const [published, setPublished] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)

  useEffect(() => {
    if (isNaN(numericStudentId)) return

    async function loadReportCardData() {
      try {
        const { data: studentData, error: studentErr } = await (supabase
          .from("students")
          .select(`roll_number, profiles ( full_name ), classes ( name )`)
          .eq("id", numericStudentId)
          .maybeSingle() as any)

        if (studentErr) throw studentErr
        if (studentData) {
          setStudent({
            name: studentData.profiles?.full_name || "Unknown Student",
            roll_number: studentData.roll_number,
            class_name: studentData.classes?.name || "Unassigned"
          })
        }

        const { data: marksData, error: marksErr } = await (supabase
          .from("marks")
          .select(`marks_obtained, remarks, exams ( max_marks, subjects ( name ) )`)
          .eq("student_id", numericStudentId) as any)

        if (marksErr) throw marksErr
        if (marksData) {
          const formattedGrades = marksData.map((m: any) => {
            const obtained = m.marks_obtained ?? 0
            const max = m.exams?.max_marks ?? 100
            const pct = max === 0 ? null : Math.round((obtained / max) * 100)
            return {
              subject_name: m.exams?.subjects?.name || "Unknown Subject",
              marks_obtained: obtained,
              max_marks: max,
              grade: pct === null ? "N/A" : (computeGrade(pct) ?? "F"),
            }
          })
          setGrades(formattedGrades)
        }

        const { data: reportCard, error: rcErr } = await (supabase
          .from("report_cards")
          .select("admin_remarks, is_published")
          .eq("student_id", numericStudentId)
          .maybeSingle() as any)

        if (rcErr) throw rcErr
        if (reportCard) {
          setRemarks(reportCard.admin_remarks || "")
          setPublished(reportCard.is_published || false)
        }
      } catch (err: any) {
        console.error("Database query failed:", err.message || err.details || err)
      } finally {
        setLoading(false)
      }
    }

    loadReportCardData()
  }, [numericStudentId])

  const handlePrint = () => window.print()

  const handleSaveChanges = async () => {
    setSaving(true)
    const { error } = await (supabase
      .from("report_cards" as any)
      .upsert({
        student_id: numericStudentId,
        admin_remarks: remarks,
        is_published: published,
        updated_at: new Date().toISOString()
      } as any, { onConflict: "student_id" }) as any)
    setSaving(false)
    if (error) {
      alert(`Error updating records: ${error.message}`)
    } else {
      alert("Academic configuration synced successfully!")
    }
  }

  if (loading) return <div className="p-6 text-center text-sm text-muted-foreground">Compiling data transcripts...</div>
  if (!student) return <div className="p-6 text-center text-sm text-destructive">Student records missing or inaccessible.</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4 print:hidden">
        <div className="space-y-1">
          <Link href="/admin/report-cards" className="text-xs text-muted-foreground hover:underline">
            &larr; Back to Report Cards Dashboard
          </Link>
          <h1 className="text-xl font-bold">Manage Performance Review</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handlePrint} className="inline-flex items-center justify-center rounded-md border bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-muted">Print Report Card</button>
          <button onClick={handleSaveChanges} disabled={saving} className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow transition-colors hover:bg-primary/90 disabled:opacity-50">
            {saving ? "Saving..." : "Save Document States"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 border bg-white text-black p-8 rounded-xl shadow-sm print:shadow-none print:border-none print:p-0 min-h-[10.5in] flex flex-col justify-between">
          <div>
            <div className="text-center border-b-2 border-black pb-4 mb-6">
              <h2 className="text-2xl font-bold tracking-wide uppercase">School ERP Academy</h2>
              <p className="text-xs tracking-widest text-muted-foreground uppercase">Official Academic Transcript Record</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-6 bg-muted/30 p-4 rounded-lg print:bg-transparent print:border print:p-3">
              <div>
                <p><span className="font-semibold text-muted-foreground print:text-black">Student Name:</span> {student.name}</p>
                <p><span className="font-semibold text-muted-foreground print:text-black">Class/Section:</span> {student.class_name}</p>
              </div>
              <div className="text-right print:text-left">
                <p><span className="font-semibold text-muted-foreground print:text-black">Roll Registration No:</span> {student.roll_number || "N/A"}</p>
              </div>
            </div>

            <table className="w-full text-sm text-left border border-collapse">
              <thead>
                <tr className="bg-black text-white print:bg-muted/50 print:text-black border-b border-black font-semibold text-xs uppercase">
                  <th className="p-3 border">Enrolled Subject Course</th>
                  <th className="p-3 border text-center">Marks Earned</th>
                  <th className="p-3 border text-center">Maximum Base</th>
                  <th className="p-3 border text-center">Assigned Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y border-b">
                {grades.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-muted-foreground italic">No examination marks logged for this student.</td>
                  </tr>
                ) : (
                  grades.map((g, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-3 font-medium border">{g.subject_name}</td>
                      <td className="p-3 text-center font-mono border">{g.marks_obtained}</td>
                      <td className="p-3 text-center font-mono text-muted-foreground print:text-black border">{g.max_marks}</td>
                      <td className="p-3 text-center font-bold font-mono text-primary print:text-black border">{g.grade}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="mt-8 space-y-2">
              <h4 className="text-xs uppercase font-bold tracking-wider text-muted-foreground print:text-black">Institutional Executive Remarks</h4>
              <p className="text-sm italic bg-muted/20 p-4 rounded-md border border-dashed print:bg-transparent print:p-2 min-h-[60px]">
                "{remarks || "No administrative updates compiled for this session reference."}"
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-12 border-t border-dashed border-gray-300 mt-12">
            <div className="text-center space-y-4">
              <div className="h-10 border-b border-black max-w-[200px] mx-auto" />
              <p className="text-xs font-medium uppercase tracking-wider">Class Advisor Signature</p>
            </div>
            <div className="text-center space-y-4">
              <div className="h-10 border-b border-black max-w-[200px] mx-auto" />
              <p className="text-xs font-medium uppercase tracking-wider">Principal Authorization Stamp</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 border bg-background p-5 rounded-xl print:hidden">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Document Controllers</h3>
          <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Public Status Visibility</label>
              <p className="text-xs text-muted-foreground">Visible to parent and student portals.</p>
            </div>
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="w-4 h-4 rounded border-input text-primary accent-black cursor-pointer" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Edit Operational Evaluation Remarks</label>
            <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={5} placeholder="Provide a general summary..." className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </div>
        </div>
      </div>
    </div>
  )
}
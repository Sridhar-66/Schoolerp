"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { admitStudent } from "@/services/students/admitStudent";
import { createClient } from "@/lib/supabase/client";

type Section = { id: number; display_name: string | null; grade: string; group_name: string };
type AcademicYear = { id: number; name: string; is_current: boolean | null };

export default function AddStudentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    dob: "",
    address: "",
    roll_number: "",
    student_type: "regular",
    section_id: "",
    academic_year_id: "",
    parent_name: "",
    parent_phone: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const [{ data: secs }, { data: years }] = await Promise.all([
        supabase.from("sections").select("id, display_name, grade, group_name").order("grade"),
        supabase.from("academic_years").select("id, name, is_current").order("name"),
      ]);
      if (secs) setSections(secs as Section[]);
      if (years) {
  setAcademicYears(years as AcademicYear[]);
  const current = (years as AcademicYear[]).find((y) => y.is_current);
  if (current) setForm((f) => ({ ...f, academic_year_id: String(current.id) }));
}
    };
    fetchData();
  }, []);

  const set = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    setError("");
    if (!form.full_name || !form.email || !form.password) {
      setError("Name, email and password are required.");
      return;
    }
    setLoading(true);
    try {
      await admitStudent({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        phone: form.phone || null,
        dob: form.dob || null,
        address: form.address || null,
        roll_number: form.roll_number || null,
        student_type: form.student_type,
        section_id: form.section_id ? Number(form.section_id) : null,
        academic_year_id: form.academic_year_id ? Number(form.academic_year_id) : null,
        parent_name: form.parent_name || null,
        parent_phone: form.parent_phone || null,
      });
      router.push("/admin/users/students");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Add Student</h1>
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Account Details</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Full Name *</label>
            <Input placeholder="e.g. Ravi Kumar" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Email *</label>
            <Input type="email" placeholder="student@school.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Password *</label>
            <Input type="password" placeholder="Min 6 characters" value={form.password} onChange={(e) => set("password", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Phone</label>
            <Input placeholder="9876543210" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Academic Details</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Academic Year</label>
              <Select value={form.academic_year_id} onValueChange={(v) => set("academic_year_id", v)}>
                <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                <SelectContent>
                  {academicYears.map((y) => (
                    <SelectItem key={y.id} value={String(y.id)}>
                      {y.name}{y.is_current ? " (Current)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Section</label>
              <Select value={form.section_id} onValueChange={(v) => set("section_id", v)}>
                <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
                <SelectContent>
                  {sections.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.display_name || `${s.grade} - ${s.group_name}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Roll Number</label>
              <Input placeholder="e.g. 2024001" value={form.roll_number} onChange={(e) => set("roll_number", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Student Type</label>
              <Select value={form.student_type} onValueChange={(v) => set("student_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="lateral">Lateral</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Date of Birth</label>
              <Input type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)} />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Address</label>
            <Input placeholder="Full address" value={form.address} onChange={(e) => set("address", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Parent / Guardian Details</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Parent Name</label>
            <Input placeholder="e.g. Suresh Kumar" value={form.parent_name} onChange={(e) => set("parent_name", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Parent Phone</label>
            <Input placeholder="9876543210" value={form.parent_phone} onChange={(e) => set("parent_phone", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSubmit} disabled={loading} className="self-start px-8">
        {loading ? "Admitting Student..." : "Admit Student"}
      </Button>
    </div>
  );
}
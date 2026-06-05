"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, UserPlus, AlertCircle } from "lucide-react";
import { admitStudent } from "@/services/students/admitStudent";
import { createClient } from "@/lib/supabase/client";

type Section = {
  id: number;
  name: string;
  class_id: number;
  classes: {
    name: string;
  } | null;
};
type AcademicYear = { id: number; name: string; is_current: boolean | null };

export default function AddStudentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingContext, setFetchingContext] = useState(true);
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
      try {
        const supabase = createClient();
        const [sectionsRes, yearsRes] = await Promise.all([
          supabase
            .from("sections")
            .select(`
              id,
              name,
              class_id,
              classes (
                name
              )
            `),
          supabase.from("academic_years").select("id, name, is_current"),
        ]);

        if (sectionsRes.data) {
          console.log("SECTIONS DATA:", sectionsRes.data);
          setSections(sectionsRes.data as Section[]);
        }
        if (yearsRes.data) {
          const yearsData = yearsRes.data as AcademicYear[];
          setAcademicYears(yearsData);
          const current = yearsData.find((y) => y.is_current === true);
          if (current) setForm((f) => ({ ...f, academic_year_id: String(current.id) }));
        }
      } catch (err) {
        console.error("Data fetch error:", err);
      } finally {
        setFetchingContext(false);
      }
    };
    fetchData();
  }, []);

  const set = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.full_name || !form.email || !form.password) {
      setError("Name, email and password fields are strictly required.");
      return;
    }
    if (!form.section_id) {
      setError("Please assign a section to track this student.");
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
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingContext) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-500 font-medium animate-pulse">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        Configuring lookup allocation tracks...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="h-9 w-9 border-slate-200" type="button">
          <ArrowLeft className="h-4 w-4 text-slate-600" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Add Student</h1>
          <p className="text-xs text-muted-foreground">Provision profile parameters and allocate class/section tracks.</p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-md text-xs font-semibold flex items-center gap-2.5 shadow-sm">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="shadow-sm border border-slate-200 bg-white">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider">Account Credentials</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500">Full Name *</label>
              <Input placeholder="e.g. Ravi Kumar" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} disabled={loading} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Email Address *</label>
                <Input type="email" placeholder="student@school.com" value={form.email} onChange={(e) => set("email", e.target.value)} disabled={loading} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Password *</label>
                <Input type="password" placeholder="Min 6 characters" value={form.password} onChange={(e) => set("password", e.target.value)} disabled={loading} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500">Contact Phone Number</label>
              <Input placeholder="9876543210" value={form.phone} onChange={(e) => set("phone", e.target.value)} disabled={loading} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-slate-200 bg-white">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider">Academic & Roster Structure</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Academic Operational Session</label>
                <select value={form.academic_year_id} onChange={(e) => set("academic_year_id", e.target.value)} disabled={loading} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                  <option value="">Select Academic Year</option>
                  {academicYears.map((y) => (
                    <option key={y.id} value={String(y.id)}>{y.name} {y.is_current ? "(Current)" : ""}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Target Assigned Section *</label>
                <select value={form.section_id} onChange={(e) => set("section_id", e.target.value)} disabled={loading} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="">Select section track</option>
                  {sections.map((s) => (
                    <option key={s.id} value={String(s.id)}>
                      {s.classes?.name ? `${s.classes.name} - ${s.name}` : s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Roll Registry Value</label>
                <Input placeholder="e.g. 2024001" value={form.roll_number} onChange={(e) => set("roll_number", e.target.value)} disabled={loading} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Enrollment Type Indicator</label>
                <select value={form.student_type} onChange={(e) => set("student_type", e.target.value)} disabled={loading} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="regular">Regular Student</option>
                  <option value="repeater">Repeater Track</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Date of Birth</label>
                <Input type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)} disabled={loading} className="block w-full" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500">Permanent Physical Address</label>
              <Input placeholder="Full residential physical address details" value={form.address} onChange={(e) => set("address", e.target.value)} disabled={loading} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-slate-200 bg-white">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider">Parent / Guardian Legal Index</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Parent / Guardian Full Name</label>
                <Input placeholder="e.g. Suresh Kumar" value={form.parent_name} onChange={(e) => set("parent_name", e.target.value)} disabled={loading} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Emergency Contact Phone</label>
                <Input placeholder="9876543210" value={form.parent_phone} onChange={(e) => set("parent_phone", e.target.value)} disabled={loading} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>Cancel</Button>
          <Button type="submit" disabled={loading} className="min-w-[150px] bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Admit Student
          </Button>
        </div>
      </form>
    </div>
  );
}
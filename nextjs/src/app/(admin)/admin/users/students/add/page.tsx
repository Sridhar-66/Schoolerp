"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { admitStudent } from "@/services/students/admitStudent";
import { createClient } from "@/lib/supabase/client";

type Class = { id: number; name: string };
type Section = { id: number; name: string; class_id: number };
type AcademicYear = { id: number; name: string; is_current: boolean | null };

const sel = "w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

export default function AddStudentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialFetchLoading, setInitialFetchLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Isolated State Registries
  const [classes, setClasses] = useState<Class[]>([]);
  const [allSections, setAllSections] = useState<Section[]>([]);
  const [filteredSections, setFilteredSections] = useState<Section[]>([]);
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
    class_id: "",
    section_id: "",
    academic_year_id: "",
    parent_name: "",
    parent_phone: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError("");
        const supabase = createClient();
        
        // Explicitly separated parallel data streams
        const [clsResult, secsResult, yearsResult] = await Promise.all([
          supabase.from("classes").select("id, name").order("name"),
          supabase.from("sections").select("id, name, class_id").order("name"),
          supabase.from("academic_years").select("id, name, is_current").order("name"),
        ]);

        if (clsResult.error) throw new Error(`Classes fetch error: ${clsResult.error.message}`);
        if (secsResult.error) throw new Error(`Sections fetch error: ${secsResult.error.message}`);
        if (yearsResult.error) throw new Error(`Academic Years fetch error: ${yearsResult.error.message}`);

        // Safe target mapping assignment - ensuring no data cross-contamination
        const fetchedClasses = clsResult.data as Class[] || [];
        const fetchedSections = secsResult.data as Section[] || [];
        const fetchedYears = yearsResult.data as AcademicYear[] || [];

        setClasses(fetchedClasses);
        setAllSections(fetchedSections);
        setAcademicYears(fetchedYears);
        
        // Auto-select current active year track context
        const currentActiveYear = fetchedYears.find((y) => y.is_current);
        if (currentActiveYear) {
          setForm((f) => ({ ...f, academic_year_id: String(currentActiveYear.id) }));
        }
      } catch (err: any) {
        console.error("Data tracking pipeline crash:", err);
        setError(err.message || "Failed to parse system master dropdown configurations.");
      } finally {
        setInitialFetchLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const updateFormField = (field: string, value: string) => {
    setForm((f) => {
      const updated = { ...f, [field]: value };
      if (field === "class_id") updated.section_id = "";
      return updated;
    });
  };

  // Cascading section filter engine update
  useEffect(() => {
    if (form.class_id) {
      setFilteredSections(allSections.filter((s) => s.class_id === Number(form.class_id)));
    } else {
      setFilteredSections([]);
    }
  }, [form.class_id, allSections]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!form.full_name || !form.email || !form.password) {
      setError("Validation Failure: Missing core user registration parameters.");
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
        class_id: form.class_id ? Number(form.class_id) : null,
        section_id: form.section_id ? Number(form.section_id) : null,
        academic_year_id: form.academic_year_id ? Number(form.academic_year_id) : null,
        parent_name: form.parent_name || null,
        parent_phone: form.parent_phone || null,
      });
      
      router.push("/admin/users/students");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Database pipeline insertion failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Add Student</h1>
        <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Account Details Block */}
        <Card className="shadow-xs border bg-background">
          <CardHeader><CardTitle className="text-base font-semibold">Account Details</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Full Name *</label>
              <Input placeholder="e.g. Ravi Kumar" value={form.full_name} onChange={(e) => updateFormField("full_name", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Email *</label>
              <Input type="email" placeholder="student@school.com" value={form.email} onChange={(e) => updateFormField("email", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Password *</label>
              <Input type="password" placeholder="Min 6 characters" value={form.password} onChange={(e) => updateFormField("password", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Phone</label>
              <Input placeholder="9876543210" value={form.phone} onChange={(e) => updateFormField("phone", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Academic Details Block */}
        <Card className="shadow-xs border bg-background">
          <CardHeader><CardTitle className="text-base font-semibold">Academic Details</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Academic Year Selector Control Element */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Academic Year</label>
                <select 
                  className={sel} 
                  value={form.academic_year_id} 
                  onChange={(e) => updateFormField("academic_year_id", e.target.value)}
                  disabled={initialFetchLoading}
                >
                  {initialFetchLoading ? (
                    <option value="">Syncing years...</option>
                  ) : academicYears.length === 0 ? (
                    <option value="">⚠️ No academic years resolved</option>
                  ) : (
                    <>
                      <option value="">Select year</option>
                      {academicYears.map((y) => (
                        <option key={y.id} value={String(y.id)}>
                          {y.name}{y.is_current ? " (Current)" : ""}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Roll Number</label>
                <Input placeholder="e.g. 2024001" value={form.roll_number} onChange={(e) => updateFormField("roll_number", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Class Selector Control Element */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Class</label>
                <select 
                  className={sel} 
                  value={form.class_id} 
                  onChange={(e) => updateFormField("class_id", e.target.value)}
                  disabled={initialFetchLoading}
                >
                  {initialFetchLoading ? (
                    <option value="">Loading database classes...</option>
                  ) : classes.length === 0 ? (
                    <option value="">⚠️ No classes found in database</option>
                  ) : (
                    <>
                      <option value="">Select class</option>
                      {classes.map((c) => (
                        <option key={c.id} value={String(c.id)}>{c.name}</option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {/* Section Selector Control Element */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Section</label>
                <select 
                  className={sel} 
                  value={form.section_id} 
                  onChange={(e) => updateFormField("section_id", e.target.value)} 
                  disabled={!form.class_id || initialFetchLoading}
                >
                  <option value="">
                    {initialFetchLoading ? "Syncing..." : form.class_id ? "Select section" : "Select class first"}
                  </option>
                  {filteredSections.map((s) => (
                    <option key={s.id} value={String(s.id)}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium">Student Type</label>
    <select 
      className={sel} 
      value={form.student_type} 
      onChange={(e) => updateFormField("student_type", e.target.value)}
    >
      <option value="regular">Regular</option>
      <option value="longterm">Long Term</option>
    </select>
  </div>
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium">Date of Birth</label>
    <Input type="date" value={form.dob} onChange={(e) => updateFormField("dob", e.target.value)} />
  </div>
</div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Address</label>
              <Input placeholder="Full address" value={form.address} onChange={(e) => updateFormField("address", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Parent / Guardian Details Block */}
        <Card className="shadow-xs border bg-background">
          <CardHeader><CardTitle className="text-base font-semibold">Parent / Guardian Details</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Parent Name</label>
              <Input placeholder="e.g. Suresh Kumar" value={form.parent_name} onChange={(e) => updateFormField("parent_name", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Parent Phone</label>
              <Input placeholder="9876543210" value={form.parent_phone} onChange={(e) => updateFormField("parent_phone", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={loading || initialFetchLoading} className="self-start px-8 shadow-xs font-medium">
          {loading ? "Admitting Student..." : "Admit Student"}
        </Button>
      </form>
    </div>
  );
}
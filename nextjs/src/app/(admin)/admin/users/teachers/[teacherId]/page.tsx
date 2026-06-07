"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getTeacherById, updateTeacher } from "@/services/teachers/actions";

export default function EditTeacherPage({ params }: { params: Promise<{ teacherId: string }> }) {
  // Catch the exact parameter matching your folder name: teacherId
  const resolvedParams = use(params);
  const teacherId = parseInt(resolvedParams.teacherId);
  
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  const [form, setForm] = useState({
    id: isNaN(teacherId) ? 0 : teacherId,
    profileId: "",
    fullName: "",
    employeeId: "",
    teacherType: "",
    joinedDate: ""
  });

  useEffect(() => {
    // Safety Guard: Don't query Supabase if the URL parameter parsing failed
    if (isNaN(teacherId)) {
      setError("Invalid Teacher Identification Key provided in URL route.");
      setLoading(false);
      return;
    }

    const loadTeacherData = async () => {
      const res = await getTeacherById(teacherId);
      if (res.success && res.data) {
        setForm({
          id: teacherId,
          profileId: res.data.profile_id,
          fullName: res.data.profiles?.full_name || "",
          employeeId: res.data.employee_id || "",
          teacherType: res.data.teacher_type || "",
          joinedDate: res.data.joined_date || ""
        });
      } else {
        setError(res.error || "Could not retrieve teacher details.");
      }
      setLoading(false);
    };
    
    loadTeacherData();
  }, [teacherId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(form.id) || form.id === 0) {
      setError("Cannot save adjustments: Invalid structural row pointer.");
      return;
    }

    setSaving(true);
    setError("");

    const res = await updateTeacher({
      id: form.id,
      profileId: form.profileId,
      fullName: form.fullName,
      employeeId: form.employeeId || null,
      teacherType: form.teacherType,
      joinedDate: form.joinedDate || null
    });

    setSaving(false);
    if (res.success) {
      router.push("/admin/users/teachers");
    } else {
      setError(res.error || "An error occurred updating the file.");
    }
  };

  if (loading) return <div className="p-8 text-sm text-slate-500">Retrieving operational file records...</div>;

  return (
    <div className="p-6 max-w-xl w-full flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link href="/admin/users/teachers" className="text-sm text-blue-600 hover:underline mb-2 block">
          ← Back to Teachers Directory
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Review & Edit Teacher Account</h1>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {!isNaN(teacherId) && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 rounded-lg shadow-sm">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
            <input
              type="text"
              required
              className="border border-slate-300 dark:border-slate-700 bg-transparent rounded px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Teacher Classification Type</label>
            <select
              className="border border-slate-300 dark:border-slate-700 bg-transparent rounded px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              value={form.teacherType}
              onChange={(e) => setForm({ ...form, teacherType: e.target.value })}
            >
              {/* Values updated to pass postgres check constraints */}
              <option value="subject" className="bg-white dark:bg-slate-900">Subject Teacher</option>
              <option value="doubt_clarifier" className="bg-white dark:bg-slate-900">Doubt Clarifier</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Employee Identification ID</label>
            <input
              type="text"
              className="border border-slate-300 dark:border-slate-700 bg-transparent rounded px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              value={form.employeeId}
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Joined Date</label>
            <input
              type="date"
              className="border border-slate-300 dark:border-slate-700 bg-transparent rounded px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              value={form.joinedDate}
              onChange={(e) => setForm({ ...form, joinedDate: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded text-sm transition-colors mt-2"
          >
            {saving ? "Saving Changes..." : "Commit Update Info"}
          </button>
        </form>
      )}
    </div>
  );
}

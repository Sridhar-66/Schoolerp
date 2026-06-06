"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getTeachers, deleteTeacher } from "@/services/teachers/actions";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const result = await getTeachers();
      if (result?.success && result.data) {
        setTeachers(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch teachers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const handleDelete = async (profileId: string) => {
    if (!confirm("Are you sure you want to delete this teacher?")) return;
    
    const result = await deleteTeacher(profileId);
    if (result.success) {
      loadTeachers();
    } else {
      alert(result.error || "Failed to delete teacher record");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Teachers Directory</h1>
        <Link 
          href="/admin/users/teachers/add" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-sm transition-colors"
        >
          Add Teacher
        </Link>
      </div>
      
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg w-full">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Type</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Employee ID</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-950">
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center text-slate-500 py-8">
                  Loading teacher records...
                </td>
              </tr>
            ) : teachers.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-slate-500 py-8">
                  No teacher records pulled yet.
                </td>
              </tr>
            ) : (
              teachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                    {teacher.profiles?.full_name || "N/A"}
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-600 dark:text-slate-400">
                    {teacher.teacher_type}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {teacher.employee_id || "—"}
                  </td>
                  <td className="px-4 py-3 text-right flex justify-end gap-2">
                    <Link
                      href={`/admin/users/teachers/${teacher.id}`}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 font-medium py-1 px-3 rounded text-xs transition-colors"
                    >
                      Edit / View
                    </Link>
                    <button 
                      onClick={() => handleDelete(teacher.profile_id)}
                      className="bg-red-600 hover:bg-red-700 text-white font-medium py-1 px-3 rounded text-xs transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
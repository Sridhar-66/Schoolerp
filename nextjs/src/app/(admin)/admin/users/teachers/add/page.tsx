"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addTeacher } from "@/services/teachers/addTeacher";

export default function AddTeacherPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
  });

  const set = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!form.full_name || !form.email || !form.password) {
      setError("Name, email and login password are required fields.");
      return;
    }
    
    setLoading(true);
    try {
      await addTeacher({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        phone: form.phone || null,
      });
      router.push("/admin/users/teachers");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected server rejection occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Onboard New Faculty</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teacher Account Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-2 rounded border border-red-200">
                {error}
              </div>
            )}
            
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Full Name *</label>
              <Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} required />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Email Address *</label>
              <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Temporary Password *</label>
                <Input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Contact Phone</label>
                <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-2">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/users/teachers")}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Registering Faculty..." : "Register Teacher"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
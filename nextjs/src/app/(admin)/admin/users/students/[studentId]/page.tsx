"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getParentByStudentId, updateParentInfo } from "@/services/parents/parents";

export default function EditParentPage() {
  const params = useParams();
  const router = useRouter();
  
  // MATCHED: lowercase studentid to perfectly match your directory tree string
  const studentid = params.studentid as string;

  const [parent, setParent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecord = async () => {
      if (!studentid) return;
      try {
        setLoading(true);
        const data = await getParentByStudentId(studentid);
        setParent(data);
      } catch (err: any) {
        console.error(err);
        setError("Could not read parent reference record.");
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [studentid]);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const parent_name = formData.get("parent_name") as string;
    const parent_phone = formData.get("parent_phone") as string;

    try {
      await updateParentInfo(studentid, {
        parent_name: parent_name || null,
        parent_phone: parent_phone || null,
      });
      
      router.push("/admin/users/parents");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to update database rows.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6 text-muted-foreground animate-pulse font-medium">Loading parent profile layout...</div>;
  if (error || !parent) {
    return (
      <div className="p-6">
        <div className="text-red-500 bg-red-50 p-4 rounded-md border border-red-200">{error || "Record missing."}</div>
        <Button asChild className="mt-4"><Link href="/admin/users/parents">Back to List</Link></Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Guardian Record</h1>
          <p className="text-sm text-muted-foreground">Modify administrative details linked directly to the child's registry row.</p>
        </div>
        <Button variant="outline" asChild><Link href="/admin/users/parents">Cancel</Link></Button>
      </div>

      <form onSubmit={handleUpdate}>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Guardian Profiles Schema Form</CardTitle>
            <CardDescription>
              This information is tied directly to the profile of student: <strong className="text-slate-900">{parent.profiles?.full_name}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="parent_name" className="text-sm font-medium text-slate-700 block">
                Parent / Guardian Full Name
              </label>
              <Input id="parent_name" name="parent_name" defaultValue={parent.parent_name || ""} placeholder="Jane Doe" required />
            </div>

            <div className="space-y-2">
              <label htmlFor="parent_phone" className="text-sm font-medium text-slate-700 block">
                Parent Phone Contact
              </label>
              <Input id="parent_phone" name="parent_phone" defaultValue={parent.parent_phone || ""} placeholder="+123456789" />
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Updating Database..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
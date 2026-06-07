"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStudentAnnouncements, Announcement } from "@/services/academic/announcements";

export default function StudentAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const supabase = createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setError("Not authenticated."); setLoading(false); return; }

        const { data: studentRaw, error: studentError } = await supabase
          .from("students")
          .select("section_id")
          .eq("profile_id", user.id)
          .single();

        if (studentError || !studentRaw) {
          setError("Could not load student profile.");
          setLoading(false);
          return;
        }

        const student = studentRaw as { section_id: number | null };
        const data = await getStudentAnnouncements(student.section_id ?? 0);
        setAnnouncements(data);
      } catch (err: any) {
        setError(err.message || "Failed to load announcements.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const formatDate = (val: string | null) => {
    if (!val) return "";
    return new Date(val).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Announcements</h1>

      {loading && (
        <p className="text-sm text-muted-foreground">Loading announcements...</p>
      )}

      {!loading && error && (
        <div className="text-xs text-red-500 bg-red-50 p-3 rounded border border-red-200">
          {error}
        </div>
      )}

      {!loading && !error && announcements.length === 0 && (
        <p className="text-sm text-muted-foreground">No announcements at this time.</p>
      )}

      {!loading && !error && announcements.map((a) => (
        <Card key={a.id}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-4">
              <CardTitle className="text-base font-semibold">{a.title}</CardTitle>
              <span className="text-xs text-muted-foreground shrink-0">{formatDate(a.created_at)}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{a.body}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
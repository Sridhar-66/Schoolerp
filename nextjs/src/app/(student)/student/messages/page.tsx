"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Thread {
  id: number;
  subject: string;
  created_at: string;
}

interface ParticipantRow {
  thread_id: number;
  message_threads: Thread | null;
}

export default function StudentMessagesPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);

  useEffect(() => {
    async function fetchUserThreads() {
      try {
        setLoading(true);

        // Get authenticated user (uuid matches profile_id)
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError("User session not found.");
          return;
        }

        // Fetch thread participants and join the message_threads metadata
        const { data, error: fetchError } = await supabase
          .from("message_thread_participants")
          .select(`
            thread_id,
            message_threads (
              id,
              subject,
              created_at
            )
          `)
          .eq("profile_id", user.id);

        if (fetchError) throw fetchError;

        // Cast to bypass Supabase client implicit 'never' type exceptions
        const genericRows = (data as unknown as ParticipantRow[]) || [];
        
        // Extract, filter out null anomalies, and sort by most recent
        const extractedThreads = genericRows
          .map((row) => row.message_threads)
          .filter((t): t is Thread => t !== null)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setThreads(extractedThreads);
      } catch (err: any) {
        console.error("Messages Fetch Error:", err);
        setError(err.message || "An unexpected error occurred while loading your conversations.");
      } finally {
        setLoading(false);
      }
    }

    fetchUserThreads();
  }, []);

  const formatMessageDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    
    // Fallback simple check to see if it's today
    const isToday = new Date().toDateString() === date.toDateString();
    if (isToday) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-muted-foreground animate-pulse font-medium">Loading inbox conversations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-xl mx-auto my-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground mt-1">Interact with your teachers, administrators, and coordinators.</p>
      </div>

      <Card className="shadow-2xs border">
        <CardHeader className="border-b bg-muted/20 py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Inbox ({threads.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-border">
          {threads.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground font-medium">
              No active message threads found.
            </div>
          ) : (
            threads.map((thread) => (
              <div
                key={thread.id}
                className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-start gap-3 min-w-0">
                  {/* Decorative Mail Avatar Element */}
                  <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs shrink-0 mt-0.5">
                    ✉️
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-foreground hover:text-primary transition-colors truncate">
                      {thread.subject || "Untitled Thread"}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      Click to expand discussion history
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-medium text-muted-foreground">
                    {formatMessageDate(thread.created_at)}
                  </span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
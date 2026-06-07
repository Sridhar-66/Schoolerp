"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getAnnouncements, AnnouncementRow } from "@/services/academic/announcements";
import { CalendarIcon, Megaphone, Search, Pin, AlertCircle } from "lucide-react";

export default function StudentAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "academic" | "event" | "urgent">("all");

  async function loadAnnouncements() {
    try {
      setLoading(true);
      setError(null);
      const data = await getAnnouncements();
      setAnnouncements(data);
    } catch (e: any) {
      setError(e.message || "Failed to load announcements.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnnouncements();
  }, []);

  function formatDate(dateString: string | null) {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // Filter logic assuming your AnnouncementRow has a 'title', 'content', and optional 'category' or 'is_pinned'
  const filteredAnnouncements = announcements.filter((item) => {
    // Category match (fallback to 'academic' if item.category doesn't exist on your schema yet)
    const itemCategory = (item as any).category?.toLowerCase() || "academic";
    if (categoryFilter !== "all" && itemCategory !== categoryFilter) return false;

    // Search query match
    if (
      search &&
      !item.title.toLowerCase().includes(search.toLowerCase()) &&
      !item.content.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Sort: Pinned announcements always climb to the top
  const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => {
    const aPinned = (a as any).is_pinned ? 1 : 0;
    const bPinned = (b as any).is_pinned ? 1 : 0;
    if (bPinned !== aPinned) return bPinned - aPinned;
    
    // Secondary sort: Newest date first
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-primary" /> School Announcements
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Stay updated with the latest notices, events, and circulars
        </p>
      </div>

      {/* Search & Dynamic Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notice updates…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-full"
          />
        </div>

        <div className="flex gap-1 border rounded-md p-1 bg-background self-stretch sm:self-auto overflow-x-auto">
          {(["all", "academic", "event", "urgent"] as const).map((category) => (
            <button
              key={category}
              onClick={() => setCategoryFilter(category)}
              className={`px-3 py-1.5 text-xs rounded font-medium capitalize whitespace-nowrap transition-colors ${
                categoryFilter === category
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Global Error Handle */}
      {error && (
        <div className="rounded-md bg-destructive/10 text-destructive px-4 py-3 text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Notice Feed */}
      <div className="flex flex-col gap-4">
        {loading ? (
          // Skeleton Loading Fallback
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse opacity-70">
              <CardHeader className="h-20 bg-muted/40 pb-2" />
              <CardContent className="h-16 bg-muted/20" />
            </Card>
          ))
        ) : sortedAnnouncements.length === 0 ? (
          // Empty State Layout
          <div className="text-center py-16 border rounded-lg border-dashed bg-card text-muted-foreground">
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-muted rounded-full">
                <Megaphone className="w-6 h-6 opacity-40" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-medium text-foreground">No announcements found</span>
                <span className="text-xs">Check back later for school notices and updates.</span>
              </div>
            </div>
          </div>
        ) : (
          // Render Filtered Data Cards
          sortedAnnouncements.map((announcement) => {
            const isPinned = (announcement as any).is_pinned;
            const isUrgent = (announcement as any).category === "urgent";

            return (
              <Card 
                key={announcement.id} 
                className={`transition-all shadow-sm ${
                  isPinned 
                    ? "border-amber-200 bg-amber-50/20 dark:border-amber-900/40 dark:bg-amber-950/5" 
                    : "hover:border-muted-foreground/20"
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
                        {isPinned && <Pin className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0 transform -rotate-45" />}
                        {announcement.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        Posted on {formatDate(announcement.created_at)}
                      </CardDescription>
                    </div>

                    {/* Badge Category Tag styling based on notice priority parameters */}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isUrgent
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                        : isPinned
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {(announcement as any).category || "Notice"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                    {announcement.content}
                  </p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
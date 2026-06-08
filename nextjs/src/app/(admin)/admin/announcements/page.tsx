"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Pin, AlertTriangle } from "lucide-react"; // Added icons for administration indicator states
import {
  getAnnouncements,
  createAnnouncement,
  toggleAnnouncementActive,
  deleteAnnouncement,
  Announcement,
} from "@/services/academic/announcements";
import { getSections, SectionWithClass } from "@/services/academic/sections";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [sections, setSections] = useState<SectionWithClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [error, setError] = useState("");

  // Form states
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("academic"); // Added state control for categories
  const [isPinned, setIsPinned] = useState(false);     // Added state control for pinning items
  const [targetType, setTargetType] = useState("all");
  const [target, setTarget] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [data, sectionData] = await Promise.all([
        getAnnouncements(),
        getSections(),
      ]);
      setAnnouncements(data);
      setSections(sectionData);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
      await loadData();
    };
    init();
  }, []);

  const resetForm = () => {
    setTitle("");
    setBody("");
    setCategory("academic");
    setIsPinned(false);
    setTargetType("all");
    setTarget("");
    setExpiresAt("");
    setError("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) { setError("Title is required."); return; }
    if (!body.trim()) { setError("Body is required."); return; }
    if ((targetType === "role" || targetType === "section") && !target) {
      setError("Please select a target value."); return;
    }
    if (!currentUserId) { setError("Could not identify current user. Please refresh."); return; }

    try {
      setSubmitting(true);
      await createAnnouncement({
        title: title.trim(),
        body: body.trim(),
        category: category, 
        is_pinned: isPinned,
        target_type: targetType,
        target: targetType === "all" ? null : target,
        expires_at: expiresAt || null,
        created_by: currentUserId,
      });
      resetForm();
      setOpen(false);
      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to create announcement.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: number, current: boolean) => {
    try {
      await toggleAnnouncementActive(id, !current);
      await loadData();
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this announcement permanently?")) return;
    try {
      await deleteAnnouncement(id);
      await loadData();
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const formatDate = (val: string | null) => {
    if (!val) return "—";
    return new Date(val).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const targetLabel = (a: Announcement) => {
    if (a.target_type === "all") return "All";
    if (a.target_type === "role") return `Role: ${a.target}`;
    if (a.target_type === "section") {
      const sec = sections.find(s => String(s.id) === a.target);
      return `Section: ${sec?.name || a.target}`;
    }
    return a.target ?? "—";
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Announcements</h1>

        <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>New Announcement</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Announcement</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="flex flex-col gap-4 py-4">
              {error && (
                <div className="text-xs text-red-500 bg-red-50 p-2 rounded border border-red-200">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="e.g., School closed on Monday"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Body</label>
                <Textarea
                  placeholder="Full announcement text..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  disabled={submitting}
                  rows={4}
                />
              </div>

              {/* Added Category Select Option */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Notice Category</label>
                <Select value={category} onValueChange={setCategory} disabled={submitting}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Academic Circular</SelectItem>
                    <SelectItem value="event">Campus Event</SelectItem>
                    <SelectItem value="urgent">Urgent Notice 🚨</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Target Audience</label>
                <Select
                  value={targetType}
                  onValueChange={(val) => { setTargetType(val); setTarget(""); }}
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Everyone</SelectItem>
                    <SelectItem value="role">By Role</SelectItem>
                    <SelectItem value="section">By Section</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {targetType === "role" && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select value={target} onValueChange={setTarget} disabled={submitting}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="students">Students</SelectItem>
                      <SelectItem value="teachers">Teachers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {targetType === "section" && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Section</label>
                  <Select value={target} onValueChange={setTarget} disabled={submitting}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.classes?.name ? `${s.classes.name} - ${s.name}` : s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Expires On <span className="text-muted-foreground font-normal">(optional)</span></label>
                <Input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  disabled={submitting}
                />
              </div>

              {/* Added Pin Notice Option */}
              <div className="flex items-center gap-2 border p-3 rounded-md bg-muted/30">
                <input
                  type="checkbox"
                  id="pinNotice"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  disabled={submitting}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="pinNotice" className="text-sm font-medium cursor-pointer select-none flex items-center gap-1.5">
                  <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Pin announcement to top of the student board
                </label>
              </div>

              <DialogFooter className="mt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Posting..." : "Post Announcement"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Target</TableHead>
            <TableHead>Posted By</TableHead>
            <TableHead>Posted On</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                Loading announcements...
              </TableCell>
            </TableRow>
          ) : announcements.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                No announcements yet. Click "New Announcement" to create one.
              </TableCell>
            </TableRow>
          ) : (
            announcements.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium max-w-[200px]">
                  <div className="flex items-center gap-1.5">
                    {a.is_pinned && <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0 transform -rotate-45" />}
                    <p className="truncate font-semibold">{a.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{a.body}</p>
                  <span className="inline-block text-[10px] uppercase font-bold mt-1 text-muted-foreground tracking-wider">
                    Category: {a.category || "academic"}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    {targetLabel(a)}
                  </span>
                </TableCell>
                <TableCell className="text-sm">{a.poster_name || "Admin Portal"}</TableCell>
                <TableCell className="text-sm">{formatDate(a.created_at)}</TableCell>
                <TableCell className="text-sm">{formatDate(a.expires_at)}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                    a.is_active
                      ? "bg-green-50 text-green-700 ring-green-700/10"
                      : "bg-gray-50 text-gray-600 ring-gray-500/10"
                  }`}>
                    {a.is_active ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggle(a.id, !!a.is_active)}
                    >
                      {a.is_active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(a.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
"use client";

import { useState, useEffect, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Megaphone, 
  Search, 
  Calendar, 
  Bell, 
  Loader2, 
  RefreshCw,
  Plus
} from "lucide-react";
import { 
  getTeacherAnnouncements, 
  createAnnouncement, 
  Announcement 
} from "@/services/academic/announcements";

export default function TeacherAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [formTitle, setFormTitle] = useState<string>("");
  const [formBody, setFormBody] = useState<string>("");
  const [formCategory, setFormCategory] = useState<string>("General");
  const [formTargetType, setFormTargetType] = useState<string>("students");

  const [isPublishing, startPublishTransition] = useTransition();

  const loadAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTeacherAnnouncements();
      setAnnouncements(data);
    } catch (err: any) {
      console.error("Error loading notices:", err);
      setError(err.message || "Failed to load notice board stream.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formBody.trim()) return;

    startPublishTransition(async () => {
      try {
        await createAnnouncement({
          title: formTitle,
          body: formBody, 
          category: formCategory,
          target_type: formTargetType,
          target: null,
          is_active: true,
        } as any);

        setFormTitle("");
        setFormBody("");
        setFormCategory("General");
        setFormTargetType("students");
        setIsDialogOpen(false);
        
        await loadAnnouncements();
      } catch (err: any) {
        console.error("Failed creating announcement:", err);
        alert(`Error publishing announcement: ${err.message}`);
      }
    });
  };

  const filteredAnnouncements = announcements.filter((ann) => {
    const titleMatch = ann.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const contentBody = ann.body || "";
    const bodyMatch = contentBody.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSearch = titleMatch || bodyMatch;
    const categoryTag = ann.category || "General";
    const matchesCategory = selectedCategory === "All" || categoryTag.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const filterTabs = ["All", "General", "Academic", "Examination"];

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto p-4 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-primary" /> Institutional Announcements
          </h1>
          <p className="text-muted-foreground text-sm">
            Current circulars, updates, and general campus briefs.
          </p>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button variant="outline" size="sm" onClick={loadAnnouncements} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1 bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4" /> Create Notice
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Compose New Announcement</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateAnnouncement} className="space-y-4 pt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Notice Title</label>
                  <Input 
                    placeholder="e.g., Pop Quiz Rescheduled" 
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Category</label>
                    <Select value={formCategory} onValueChange={setFormCategory}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Academic">Academic</SelectItem>
                        <SelectItem value="Examination">Examination</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Audience Target</label>
                    <Select value={formTargetType} onValueChange={setFormTargetType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="students">Students Only</SelectItem>
                        <SelectItem value="teachers">Teachers Only</SelectItem>
                        <SelectItem value="all">Everyone (Global)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Message Body</label>
                  <Textarea 
                    placeholder="Type the formal details here..." 
                    rows={5}
                    value={formBody}
                    onChange={(e) => setFormBody(e.target.value)}
                    required
                  />
                </div>

                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isPublishing}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPublishing}>
                    {isPublishing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                    Publish Notice
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/20 p-3 rounded-lg border">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notice text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {filterTabs.map((tab) => (
            <Button
              key={tab}
              variant={selectedCategory === tab ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(tab)}
              className="rounded-md"
            >
              {tab}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-20 gap-2 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">Reading notice board entries...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
          <strong>Initialization Error:</strong> {error}
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="text-center text-muted-foreground py-16 border border-dashed rounded-lg bg-muted/5">
          <Bell className="h-10 w-10 mx-auto mb-2 text-muted-foreground/40" />
          <p className="text-sm font-medium">No notice records match the query conditions.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredAnnouncements.map((ann) => {
            const dateDisplay = ann.created_at 
              ? new Date(ann.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : "Recent";

            return (
              <Card key={ann.id} className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-semibold text-foreground">{ann.title}</CardTitle>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{dateDisplay}</span>
                        <span>•</span>
                        <span className="capitalize px-1.5 py-0.5 rounded bg-muted border text-[10px] font-medium">
                          Audience: {ann.target_type}
                        </span>
                      </div>
                    </div>
                    <span className="inline-flex items-center rounded-full border border-muted-foreground/30 px-2.5 py-0.5 text-xs font-medium bg-background text-foreground capitalize">
                      {ann.category || "General"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap bg-muted/30 p-3 rounded border">
                    {ann.body || "No details provided."}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
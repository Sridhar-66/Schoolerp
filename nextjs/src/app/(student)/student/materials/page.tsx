"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Material {
  id: number;
  title: string;
  description: string | null;
  file_url: string;
  subject_id: number;
  subjects: {
    name: string;
    code: string;
  } | null;
}

interface SubjectDropdownItem {
  id: number;
  name: string;
  code: string;
}

export default function StudentMaterialsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [subjects, setSubjects] = useState<SubjectDropdownItem[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("all");

  // Required styling class for native select from handoff instructions
  const sel = "h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-64 shadow-2xs";

  useEffect(() => {
    async function fetchMaterials() {
      try {
        setLoading(true);

        // ⚠️ Critical Pattern Match: Student Identity Verification
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError("User session not found.");
          return;
        }

        const { data: studentRaw } = await supabase
          .from("students")
          .select("id, section_id")
          .eq("profile_id", user.id)
          .single();

        const student = studentRaw as { id: number; section_id: number } | null;
        if (!student) {
          setError("Student profile context missing.");
          return;
        }

        // Fetch course materials joined with subject metadata
        const { data: materialsData, error: materialsError } = await supabase
          .from("materials")
          .select(`
            id,
            title,
            description,
            file_url,
            subject_id,
            subjects (
              name,
              code
            )
          `)
          .eq("section_id", student.section_id);

        if (materialsError) throw materialsError;

        const typedMaterials = (materialsData as unknown as Material[]) || [];
        setMaterials(typedMaterials);

        // Extract and aggregate unique subjects from materials list to populate filter dropdown safely
        const uniqueSubjectsMap: Record<number, SubjectDropdownItem> = {};
        typedMaterials.forEach((item) => {
          if (item.subject_id && item.subjects) {
            uniqueSubjectsMap[item.subject_id] = {
              id: item.subject_id,
              name: item.subjects.name,
              code: item.subjects.code,
            };
          }
        });

        setSubjects(Object.values(uniqueSubjectsMap));
      } catch (err: any) {
        console.error("Materials Fetch Error:", err);
        setError(err.message || "Failed to load study references.");
      } finally {
        setLoading(false);
      }
    }

    fetchMaterials();
  }, []);

  // Filter list down based on native select value
  const filteredMaterials = selectedSubjectId === "all"
    ? materials
    : materials.filter(m => m.subject_id === parseInt(selectedSubjectId, 10));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-muted-foreground animate-pulse font-medium">Loading course materials...</div>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Study Materials</h1>
          <p className="text-muted-foreground mt-1">Access lecture notes, reference PDFs, and files uploaded by your teachers.</p>
        </div>

        {/* Native HTML Select Component implemented using designated styling parameters */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="subject-filter" className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
            Filter By Subject
          </label>
          <select
            id="subject-filter"
            className={sel}
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
          >
            <option value="all">All Subjects ({materials.length})</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name} ({sub.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      <hr className="border-muted" />

      {/* Materials List Rendering Grid */}
      {filteredMaterials.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/10">
          <p className="text-muted-foreground font-medium">No study materials are available for the selected view.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMaterials.map((material) => (
            <Card key={material.id} className="hover:shadow-md transition-shadow flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-bold line-clamp-1 text-foreground">
                      {material.title}
                    </CardTitle>
                    {material.subjects && (
                      <span className="inline-block text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                        {material.subjects.name} • {material.subjects.code}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 flex flex-col gap-4 flex-1 justify-between">
                <div>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {material.description || "No dynamic overview notes provided for this file resource."}
                  </p>
                </div>

                <div className="pt-2">
                  <a
                    href={material.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 w-full text-center"
                  >
                    View / Download Document
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
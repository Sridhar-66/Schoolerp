"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layers, Users, ChevronRight, Plus, Loader2 } from "lucide-react";
import { 
  getClasses, 
  addClass, 
  getClassDetails, 
  addSection, 
  ClassWithCount 
} from "@/services/academic/classes";

export default function AcademicCommandCenter() {
  // Master State (Left Panel)
  const [classes, setClasses] = useState<ClassWithCount[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [newClassName, setNewClassName] = useState("");
  const [submittingClass, setSubmittingClass] = useState(false);

  // Detail State (Right Panel)
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [activeClassDetails, setActiveClassDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [submittingSection, setSubmittingSection] = useState(false);

  const [error, setError] = useState("");

  // Load Initial Data
  const loadMasterList = async () => {
    try {
      setLoadingClasses(true);
      const data = await getClasses();
      setClasses(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingClasses(false);
    }
  };

  useEffect(() => {
    loadMasterList();
  }, []);

  // Handle Class Selection
  const handleSelectClass = async (classId: number) => {
    setSelectedClassId(classId);
    setNewSectionName("");
    try {
      setLoadingDetails(true);
      setError("");
      const details = await getClassDetails(classId);
      setActiveClassDetails(details);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Form Handlers
  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    try {
      setSubmittingClass(true);
      await addClass(newClassName);
      setNewClassName("");
      await loadMasterList(); // Refresh list to show new class
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmittingClass(false);
    }
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim() || !selectedClassId) return;
    try {
      setSubmittingSection(true);
      await addSection(selectedClassId, newSectionName);
      setNewSectionName("");
      await handleSelectClass(selectedClassId); // Refresh details to show new section
      await loadMasterList(); // Refresh master list to update section count
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmittingSection(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Academic Structure</h1>
        <p className="text-sm text-muted-foreground">
          Manage classes and provision sections. This hierarchy powers the entire timetable matrix.
        </p>
      </div>

      {error && (
        <div className="text-xs text-red-500 bg-red-50 p-3 rounded-md border border-red-200 shadow-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* LEFT PANEL: CLASSES */}
        <Card className="md:col-span-5 shadow-sm">
          <CardHeader className="bg-slate-50/50 border-b pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Layers className="h-5 w-5 text-blue-600" />
              Classes Directory
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <form onSubmit={handleAddClass} className="flex gap-2 p-4 border-b bg-white">
              <Input 
                placeholder="e.g., Jr. MPC" 
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                disabled={submittingClass}
              />
              <Button type="submit" disabled={submittingClass || !newClassName.trim()}>
                {submittingClass ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add
              </Button>
            </form>

            <div className="flex flex-col max-h-[500px] overflow-y-auto p-2">
              {loadingClasses ? (
                <div className="text-center p-4 text-sm text-slate-500 animate-pulse">Loading classes...</div>
              ) : classes.length === 0 ? (
                <div className="text-center p-6 text-sm text-slate-500">No classes provisioned yet.</div>
              ) : (
                classes.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => handleSelectClass(cls.id)}
                    className={`flex items-center justify-between p-3 rounded-md transition-colors text-left border ${
                      selectedClassId === cls.id 
                        ? "bg-blue-50 border-blue-200" 
                        : "bg-transparent border-transparent hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <div className={`font-medium ${selectedClassId === cls.id ? "text-blue-900" : "text-slate-700"}`}>
                        {cls.name}
                      </div>
                      <div className="text-xs text-slate-500">{cls.section_count} Sections linked</div>
                    </div>
                    <ChevronRight className={`h-4 w-4 ${selectedClassId === cls.id ? "text-blue-500" : "text-slate-300"}`} />
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* RIGHT PANEL: SECTIONS */}
        <Card className="md:col-span-7 shadow-sm">
          {!selectedClassId ? (
            <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
              Select a class from the directory to manage its sections.
            </div>
          ) : (
            <>
              <CardHeader className="bg-slate-50/50 border-b pb-4">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-indigo-600" />
                    Sections for {activeClassDetails?.name || "..."}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <form onSubmit={handleAddSection} className="flex gap-2 p-4 border-b bg-white">
                  <Input 
                    placeholder="e.g., Section A" 
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    disabled={submittingSection || loadingDetails}
                  />
                  <Button type="submit" variant="secondary" disabled={submittingSection || loadingDetails || !newSectionName.trim()}>
                    {submittingSection ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Add Section
                  </Button>
                </form>

                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto">
                  {loadingDetails ? (
                    <div className="col-span-2 text-center p-4 text-sm text-slate-500 animate-pulse">Querying sections...</div>
                  ) : activeClassDetails?.sections?.length === 0 ? (
                    <div className="col-span-2 text-center p-8 text-sm border border-dashed rounded-md text-slate-500">
                      No sections allocated. Add one above.
                    </div>
                  ) : (
                    activeClassDetails?.sections.map((sec: any) => (
                      <div key={sec.id} className="flex items-center justify-between bg-slate-50 border px-3 py-3 rounded-md">
                        <span className="font-medium text-slate-700 text-sm">{sec.name}</span>
                        <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                          ID: {sec.id}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
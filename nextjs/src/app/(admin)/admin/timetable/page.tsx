import Link from "next/link";
import { getClasses } from "@/services/academic/classes";
import { CalendarDays, ChevronRight, LayoutGrid } from "lucide-react";

export const revalidate = 0;

export default async function TimetablePage() {
  let classes: { id: number; name: string; section_count: number }[] = [];

  try {
    classes = await getClasses();
  } catch (err) {
    console.error("Failed to load classes for timetable index:", err);
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Timetable Management</h1>
        <p className="text-sm text-muted-foreground">
          Select a class to view and configure its section timetables.
        </p>
      </div>

      {classes.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 border border-dashed rounded-xl p-16 text-center">
          <CalendarDays className="h-10 w-10 text-slate-300" />
          <p className="font-medium text-slate-500">No classes found</p>
          <p className="text-sm text-slate-400">
            Add classes first via{" "}
            <Link href="/admin/academic/classes" className="text-blue-600 underline underline-offset-2">
              Academic → Classes
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <Link
              key={cls.id}
              href={`/admin/timetable/${cls.id}`}
              className="group flex items-center justify-between p-5 rounded-xl border bg-white shadow-sm hover:border-blue-300 hover:shadow-md transition-all duration-150"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                  <LayoutGrid className="h-4 w-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
                    {cls.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {cls.section_count} section{cls.section_count !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-400 transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
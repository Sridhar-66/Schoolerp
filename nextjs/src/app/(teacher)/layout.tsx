"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { label: "Dashboard",   href: "/teacher/dashboard" },
  { label: "Attendance",  href: "/teacher/attendance" },
  { label: "Assignments", href: "/teacher/assignments" },
  { label: "Marks",       href: "/teacher/marks" },
  { label: "Announcements", href: "/teacher/announcements" },
  { label: "Timetable",   href: "/teacher/timetable" },
];

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r bg-muted/40 flex flex-col p-4 gap-1">
        <p className="font-bold text-lg mb-4 px-2">Teacher Portal</p>
        <nav className="flex flex-col gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm px-3 py-2 rounded-md transition-colors font-medium ${
                pathname === l.href || pathname.startsWith(l.href + "/")
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex flex-col flex-1">
        <header className="h-12 border-b flex items-center justify-between px-6">
          <span className="font-medium">Welcome, Teacher</span>
          <div className="w-8 h-8 rounded-full bg-muted border border-muted-foreground/10" />
        </header>
        <main className="flex-1 p-6 bg-background">{children}</main>
      </div>
    </div>
  );
}
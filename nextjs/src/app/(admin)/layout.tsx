import Link from "next/link"

const links = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Years", href: "/admin/academic/years" },
  { label: "Classes", href: "/admin/academic/classes" },
  { label: "Sections", href: "/admin/academic/sections" },
  { label: "Subjects", href: "/admin/academic/subjects" },
  { label: "Timetable", href: "/admin/timetable" },
  { label: "Examinations", href: "/admin/examinations" },
  { label: "Fees", href: "/admin/fees" },
  { label: "Teachers", href: "/admin/users/teachers" },
  { label: "Students", href: "/admin/users/students" },
  { label: "Parents", href: "/admin/users/parents" },
  { label: "Staff", href: "/admin/users/staff" },
  { label: "Attendance", href: "/admin/attendance" },
  { label: "Report Cards", href: "/admin/report-cards" },
  { label: "Announcements", href: "/admin/announcements" },
  { label: "Analytics", href: "/admin/analytics" },
  { label: "Grading", href: "/admin/settings/grading" },
  { label: "Calendar", href: "/admin/settings/calendar" },
  { label: "Holidays", href: "/admin/settings/holidays" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-56 border-r bg-muted/40 flex flex-col p-4 gap-1 overflow-y-auto shrink-0">
        <p className="font-bold text-lg mb-4">ERP Admin</p>
        {links.map(l => (
          <Link key={l.href} href={l.href} className="text-sm px-2 py-1 rounded hover:bg-muted">{l.label}</Link>
        ))}
      </aside>
      <div className="flex flex-col flex-1 min-w-0">
        <header className="h-12 border-b flex items-center justify-between px-6 shrink-0">
          <span className="font-medium">School ERP</span>
          <div className="w-8 h-8 rounded-full bg-muted" />
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
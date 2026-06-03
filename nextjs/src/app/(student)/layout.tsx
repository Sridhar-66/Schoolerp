import Link from "next/link"

const links = [
  { label: "Dashboard", href: "/student/dashboard" },
  { label: "Attendance", href: "/student/attendance" },
  { label: "Results", href: "/student/results" },
  { label: "Assignments", href: "/student/assignments" },
  { label: "Timetable", href: "/student/timetable" },
  { label: "Announcements", href: "/student/announcements" },
  { label: "Fees", href: "/student/fees" },
  { label: "Materials", href: "/student/materials" },
  { label: "Leave", href: "/student/leave" },
  { label: "Messages", href: "/student/messages" },
]

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r bg-muted/40 flex flex-col p-4 gap-1">
        <p className="font-bold text-lg mb-4">Student Portal</p>
        {links.map(l => (
          <Link key={l.href} href={l.href} className="text-sm px-2 py-1 rounded hover:bg-muted">{l.label}</Link>
        ))}
      </aside>
      <div className="flex flex-col flex-1">
        <header className="h-12 border-b flex items-center justify-between px-6">
          <span className="font-medium">Welcome, Student</span>
          <div className="w-8 h-8 rounded-full bg-muted" />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}


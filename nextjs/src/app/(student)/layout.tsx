import Link from "next/link"

const links = [
  { label: "Dashboard", href: "/student/dashboard" },
  { label: "Attendance", href: "/student/attendance" },
  { label: "Examinations", href: "/student/examinations" },
  { label: "Results", href: "/student/results" },
  { label: "Timetable", href: "/student/timetable" }, // Removed Assignments right above this
  { label: "Announcements", href: "/student/announcements" },
  { label: "Fees", href: "/student/fees" },
  { label: "Materials", href: "/student/materials" },
  { label: "Leave", href: "/student/leave" },
  { label: "Profile", href: "/student/profile" },
]

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar Navigation */}
      <aside className="w-56 border-r bg-muted/40 flex flex-col p-4 gap-1">
        <p className="font-bold text-lg mb-4">Student Portal</p>
        {links.map(l => (
          <Link 
            key={l.href} 
            href={l.href} 
            className="text-sm px-2 py-1 rounded hover:bg-muted transition-colors"
          >
            {l.label}
          </Link>
        ))}
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1">
        <header className="h-12 border-b flex items-center justify-between px-6">
          <span className="font-medium">Welcome, Student</span>
          
          {/* Linked Avatar for better UX */}
          <Link href="/student/profile" title="View Profile">
            <div className="w-8 h-8 rounded-full bg-muted border hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer" />
          </Link>
        </header>
        
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const stats = ["Attendance %", "Pending Assignments", "Next Exam"]

export default function StudentDashboard() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()

    await supabase.auth.signOut()

    router.push("/auth/login")
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header section matching the admin dashboard structure */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Student Dashboard
        </h1>

        <button
          onClick={handleLogout}
          className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s}>
            <CardHeader>
              <CardTitle className="text-sm">
                {s}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">—</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Announcements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No announcements.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

const stats = [
  { title: "Total Students", value: 1240 },
  { title: "Total Teachers", value: 58 },
  { title: "Classes", value: 32 },
  { title: "Pending Fees", value: "₹45K" },
]

export default function AdminDashboard() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()

    await supabase.auth.signOut()

    router.push("/auth/login")
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-6">
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Dashboard
        </h1>

        <button
          onClick={handleLogout}
          className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.title}>
            <CardHeader>
              <CardTitle className="text-sm">
                {s.title}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-3xl font-bold">
                {s.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Recent Activity
          </CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-muted-foreground text-sm">
            No recent activity.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
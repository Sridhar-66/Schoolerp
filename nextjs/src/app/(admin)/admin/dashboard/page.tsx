"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

type Stats = {
  totalStudents: number
  totalTeachers: number
  totalSections: number
  pendingFeesAmount: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient()

      const [
        { count: totalStudents },
        { count: totalTeachers },
        { count: totalSections },
        { data: pendingFees },
      ] = await Promise.all([
        supabase
          .from("students")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("teachers")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("sections")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("fee_payments")
          .select("amount_paid")
          .eq("status", "Pending"),
      ])

      const pendingFeesAmount = (pendingFees ?? []).reduce(
  (sum, row: { amount_paid: number | null }) => sum + (row.amount_paid ?? 0),
  0
)

      setStats({
        totalStudents: totalStudents ?? 0,
        totalTeachers: totalTeachers ?? 0,
        totalSections: totalSections ?? 0,
        pendingFeesAmount,
      })

      setLoading(false)
    }

    fetchStats()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
    return `₹${amount}`
  }

  const statCards = stats
    ? [
        { title: "Total Students", value: stats.totalStudents },
        { title: "Total Teachers", value: stats.totalTeachers },
        { title: "Sections", value: stats.totalSections },
        { title: "Pending Fees", value: formatCurrency(stats.pendingFeesAmount) },
      ]
    : []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="text-sm bg-muted animate-pulse rounded h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <div className="bg-muted animate-pulse rounded h-8 w-16" />
                </CardContent>
              </Card>
            ))
          : statCards.map((s) => (
              <Card key={s.title}>
                <CardHeader>
                  <CardTitle className="text-sm">{s.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{s.value}</p>
                </CardContent>
              </Card>
            ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No recent activity.</p>
        </CardContent>
      </Card>
    </div>
  )
}
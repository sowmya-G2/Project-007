import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardLayoutClient from "@/components/dashboard-layout-client"
import { Suspense } from "react"

function LayoutLoading() {
  return (
    <div className="flex h-screen bg-gray-900">
      <div className="w-64 bg-gray-800 border-r border-gray-700">
        <div className="p-4">
          <div className="h-8 bg-gray-700 rounded animate-pulse mb-4" />
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-6 bg-gray-700 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    </div>
  )
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  return (
    <Suspense fallback={<LayoutLoading />}>
      <DashboardLayoutClient user={data.user} profile={profile} children={children} />
    </Suspense>
  )
}

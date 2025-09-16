import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import CustomizableHome from "@/components/customizable-home"
import { Suspense } from "react"

function DashboardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <Suspense fallback={<DashboardLoading />}>
      <CustomizableHome />
    </Suspense>
  )
}

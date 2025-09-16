import { requireAdmin } from "@/lib/admin-auth"
import { createClient } from "@/lib/supabase/server"
import { AdminDashboardClient } from "@/components/admin-dashboard-client"
import { AdminAnalytics } from "@/components/admin-analytics"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function AdminDashboardPage() {
  const adminUser = await requireAdmin()
  const supabase = await createClient()

  // Get dashboard stats
  const [{ count: totalUsers }, { count: activeUsers }, { count: totalSessions }, { data: recentActivity }] =
    await Promise.all([
      supabase.from("user_profiles").select("*", { count: "exact", head: true }),
      supabase
        .from("user_profiles")
        .select("*", { count: "exact", head: true })
        .gte("updated_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      supabase.from("client_activity_logs").select("*", { count: "exact", head: true }),
      supabase
        .from("client_activity_logs")
        .select("*, user_profiles(full_name, email)")
        .order("created_at", { ascending: false })
        .limit(10),
    ])

  const stats = {
    totalUsers: totalUsers || 0,
    activeUsers: activeUsers || 0,
    totalSessions: totalSessions || 0,
    recentActivity: recentActivity || [],
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="p-6">
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <AdminDashboardClient adminUser={adminUser} initialStats={stats} />
          </TabsContent>

          <TabsContent value="analytics">
            <AdminAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

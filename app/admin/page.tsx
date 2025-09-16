import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/login")
  }

  // Check if user is admin
  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("*, admin_roles(*)")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single()

  if (!adminUser) {
    redirect("/admin/unauthorized")
  }

  redirect("/admin/dashboard")
}

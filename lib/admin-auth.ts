import { createClient } from "@/lib/supabase/server"

export interface AdminUser {
  id: string
  user_id: string
  role_id: string
  is_active: boolean
  last_login: string | null
  admin_roles: {
    id: string
    name: string
    permissions: Record<string, string[]>
  }
}

export async function getAdminUser(): Promise<AdminUser | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("*, admin_roles(*)")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single()

  return adminUser
}

export function hasPermission(adminUser: AdminUser, resource: string, action: string): boolean {
  const permissions = adminUser.admin_roles.permissions
  return permissions[resource]?.includes(action) || false
}

export async function requireAdmin() {
  const adminUser = await getAdminUser()
  if (!adminUser) {
    throw new Error("Admin access required")
  }
  return adminUser
}

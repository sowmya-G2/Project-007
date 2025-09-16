import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function HomePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()

  // If user is authenticated, redirect to dashboard
  if (data?.user) {
    redirect("/dashboard")
  }

  // If not authenticated, redirect to login
  redirect("/auth/login")
}

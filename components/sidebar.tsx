"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Boxes,
  BarChart3,
  TrendingUp,
  Newspaper,
  Bot,
  GraduationCap,
  UserIcon,
  Settings,
  CreditCard,
  LogOut,
  ChevronRight,
  Beaker,
  Menu,
  ChevronLeft,
  Brain,
  Lightbulb,
} from "lucide-react"

interface Profile {
  id: string
  email: string
  display_name: string
  selected_ai_assistant: string
  ai_assistant_configured: boolean
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

interface SidebarProps {
  activeWorkspace: "trading" | "research" | "refinery"
  activeMenu: string
  onWorkspaceChange: (workspace: "trading" | "research" | "refinery") => void
  onMenuChange: (menu: string) => void
  selectedAssistant?: string
  user?: User
  profile?: Profile | null
}

const tradingMenus = [
  { id: "home", label: "Sandbox", icon: Boxes },
  { id: "dashboard", label: "Trading Dashboard", icon: BarChart3 },
  { id: "market", label: "Market", icon: TrendingUp },
  { id: "news", label: "News", icon: Newspaper },
]

const getResearchMenus = (selectedAssistant?: string) => [
  { id: "home", label: "Sandbox", icon: Boxes },
  { id: "ai-assistant", label: selectedAssistant || "AI Assistant", icon: Bot },
]

const refineryMenus = [
  { id: "home", label: "Sandbox", icon: Boxes },
  { id: "knowledge-base", label: "Wisdom Bank", icon: Brain },
  { id: "learning-center", label: "Academy", icon: GraduationCap },
  { id: "interactive-training", label: "Mentora", icon: Lightbulb },
]

export default function Sidebar({
  activeWorkspace,
  activeMenu,
  onWorkspaceChange,
  onMenuChange,
  selectedAssistant,
  user,
  profile,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "User"
  const userInitials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const currentMenus =
    activeWorkspace === "trading"
      ? tradingMenus
      : activeWorkspace === "research"
        ? getResearchMenus(selectedAssistant)
        : refineryMenus

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const handleProfileClick = () => {
    router.push("/profile")
  }

  const handleSettingsClick = () => {
    router.push("/settings")
  }

  const handleBillingClick = () => {
    router.push("/billing")
  }

  return (
    <div
      className={`${isCollapsed ? "w-16" : "w-64"} bg-gray-900 border-r border-gray-700 flex flex-col h-screen transition-all duration-300`}
    >
      <div className="p-2 border-b border-gray-700 flex justify-between items-center">
        {!isCollapsed && <div className="text-sm font-medium text-gray-300">AI Trading Assistant</div>}
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white hover:bg-gray-800"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Workspace Selector */}
      <div className="p-2 border-b border-gray-700">
        <div className="space-y-1">
          <Button
            variant={activeWorkspace === "trading" ? "default" : "ghost"}
            className={`w-full ${isCollapsed ? "justify-center px-2" : "justify-start"} ${
              activeWorkspace === "trading"
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "text-gray-300 hover:text-white hover:bg-gray-800"
            }`}
            onClick={() => onWorkspaceChange("trading")}
            title={isCollapsed ? "Trading Hub" : undefined}
          >
            <BarChart3 className={`h-4 w-4 ${!isCollapsed ? "mr-2" : ""}`} />
            {!isCollapsed && "Trading Hub"}
          </Button>
          <Button
            variant={activeWorkspace === "research" ? "default" : "ghost"}
            className={`w-full ${isCollapsed ? "justify-center px-2" : "justify-start"} ${
              activeWorkspace === "research"
                ? "bg-purple-600 hover:bg-purple-700 text-white"
                : "text-gray-300 hover:text-white hover:bg-gray-800"
            }`}
            onClick={() => onWorkspaceChange("research")}
            title={isCollapsed ? "Research Lab" : undefined}
          >
            <Bot className={`h-4 w-4 ${!isCollapsed ? "mr-2" : ""}`} />
            {!isCollapsed && "Research Lab"}
          </Button>
          <Button
            variant={activeWorkspace === "refinery" ? "default" : "ghost"}
            className={`w-full ${isCollapsed ? "justify-center px-2" : "justify-start"} ${
              activeWorkspace === "refinery"
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "text-gray-300 hover:text-white hover:bg-gray-800"
            }`}
            onClick={() => onWorkspaceChange("refinery")}
            title={isCollapsed ? "Refinery" : undefined}
          >
            <Beaker className={`h-4 w-4 ${!isCollapsed ? "mr-2" : ""}`} />
            {!isCollapsed && "Refinery"}
          </Button>
        </div>
      </div>

      {/* Menu Items */}
      <ScrollArea className="flex-1 px-2 py-2">
        <div className="space-y-1">
          {currentMenus.map((menu) => {
            const Icon = menu.icon
            return (
              <Button
                key={menu.id}
                variant={activeMenu === menu.id ? "secondary" : "ghost"}
                className={`w-full ${isCollapsed ? "justify-center px-2" : "justify-start"} ${
                  activeMenu === menu.id ? "bg-gray-700 text-white" : "text-gray-300 hover:text-white hover:bg-gray-800"
                }`}
                onClick={() => onMenuChange(menu.id)}
                title={isCollapsed ? menu.label : undefined}
              >
                <Icon className={`h-4 w-4 ${!isCollapsed ? "mr-2" : ""}`} />
                {!isCollapsed && menu.label}
                {!isCollapsed && activeMenu === menu.id && <ChevronRight className="ml-auto h-4 w-4" />}
              </Button>
            )
          })}
        </div>
      </ScrollArea>

      {/* User Profile */}
      <div className="p-2 border-t border-gray-700">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={`w-full ${isCollapsed ? "justify-center px-2" : "justify-start"} p-2 h-auto text-gray-300 hover:text-white hover:bg-gray-800`}
              title={isCollapsed ? displayName : undefined}
            >
              <Avatar className={`h-8 w-8 ${!isCollapsed ? "mr-3" : ""}`}>
                <AvatarImage src="/diverse-user-avatars.png" />
                <AvatarFallback className="bg-blue-600 text-white">{userInitials}</AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{displayName}</span>
                  <span className="text-xs text-gray-400">{user?.email}</span>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-gray-800 border-gray-700">
            <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-700" onClick={handleProfileClick}>
              <UserIcon className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-gray-300 hover:text-white hover:bg-gray-700"
              onClick={handleSettingsClick}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-700" onClick={handleBillingClick}>
              <CreditCard className="mr-2 h-4 w-4" />
              Billing
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuItem className="text-red-400 hover:text-red-300 hover:bg-gray-700" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

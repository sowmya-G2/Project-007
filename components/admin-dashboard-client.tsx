"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Users,
  Activity,
  Settings,
  Search,
  MoreHorizontal,
  UserCheck,
  LogOut,
  Shield,
  Plus,
  Bot,
  Edit,
  Trash2,
} from "lucide-react"
import type { AdminUser } from "@/lib/admin-auth"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalSessions: number
  recentActivity: any[]
}

interface AdminDashboardClientProps {
  adminUser: AdminUser
  initialStats: DashboardStats
}

export function AdminDashboardClient({ adminUser, initialStats }: AdminDashboardClientProps) {
  const [stats, setStats] = useState(initialStats)
  const [users, setUsers] = useState<any[]>([])
  const [aiConfigs, setAiConfigs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false)
  const [editingConfig, setEditingConfig] = useState<any>(null)
  const [configForm, setConfigForm] = useState({
    name: "",
    description: "",
    model_provider: "groq",
    model_name: "llama-3.1-70b-versatile",
    system_prompt: "",
    max_tokens: 1000,
    temperature: 0.7,
    is_active: true,
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadUsers()
    loadAiConfigs()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from("user_profiles").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error("Error loading users:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadAiConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_assistant_configs")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setAiConfigs(data || [])
    } catch (error) {
      console.error("Error loading AI configs:", error)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  const filteredUsers = users.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSaveConfig = async () => {
    try {
      if (editingConfig) {
        // Update existing config
        const { error } = await supabase.from("ai_assistant_configs").update(configForm).eq("id", editingConfig.id)

        if (error) throw error
        toast.success("AI Assistant configuration updated successfully")
      } else {
        // Create new config
        const { error } = await supabase.from("ai_assistant_configs").insert([configForm])

        if (error) throw error
        toast.success("AI Assistant configuration created successfully")
      }

      setIsConfigDialogOpen(false)
      setEditingConfig(null)
      resetConfigForm()
      loadAiConfigs()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleEditConfig = (config: any) => {
    setEditingConfig(config)
    setConfigForm({
      name: config.name,
      description: config.description || "",
      model_provider: config.model_provider,
      model_name: config.model_name,
      system_prompt: config.system_prompt || "",
      max_tokens: config.max_tokens,
      temperature: config.temperature,
      is_active: config.is_active,
    })
    setIsConfigDialogOpen(true)
  }

  const handleDeleteConfig = async (configId: string) => {
    if (!confirm("Are you sure you want to delete this AI assistant configuration?")) return

    try {
      const { error } = await supabase.from("ai_assistant_configs").delete().eq("id", configId)

      if (error) throw error
      toast.success("AI Assistant configuration deleted successfully")
      loadAiConfigs()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const resetConfigForm = () => {
    setConfigForm({
      name: "",
      description: "",
      model_provider: "groq",
      model_name: "llama-3.1-70b-versatile",
      system_prompt: "",
      max_tokens: 1000,
      temperature: 0.7,
      is_active: true,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-purple-600" />
            <div>
              <h1 className="text-xl font-bold">Admin Portal</h1>
              <p className="text-sm text-muted-foreground">AI Trading Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">{adminUser.admin_roles.name}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{adminUser.admin_roles.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered clients</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSessions}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Assistants</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Active configurations</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="activity">Activity Logs</TabsTrigger>
            <TabsTrigger value="ai-config">AI Configuration</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage client accounts and permissions</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>AI Assistant</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                              <AvatarFallback>{user.full_name?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.full_name || "No name"}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.selected_ai_assistant || "None"}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.onboarding_completed ? "default" : "secondary"}>
                            {user.onboarding_completed ? "Active" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Reset Password</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">Suspend Account</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest user activities and system events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 rounded-lg border">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-medium">{activity.activity_type}</div>
                        <div className="text-sm text-muted-foreground">
                          {activity.user_profiles?.full_name || activity.user_profiles?.email}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(activity.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-config" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>AI Assistant Configuration</CardTitle>
                    <CardDescription>Manage AI assistant settings and models</CardDescription>
                  </div>
                  <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => {
                          setEditingConfig(null)
                          resetConfigForm()
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add AI Assistant
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{editingConfig ? "Edit AI Assistant" : "Create AI Assistant"}</DialogTitle>
                        <DialogDescription>Configure the AI assistant settings and behavior.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                              id="name"
                              value={configForm.name}
                              onChange={(e) => setConfigForm({ ...configForm, name: e.target.value })}
                              placeholder="Trading Expert"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="model_provider">Model Provider</Label>
                            <Select
                              value={configForm.model_provider}
                              onValueChange={(value) => setConfigForm({ ...configForm, model_provider: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="groq">Groq</SelectItem>
                                <SelectItem value="openai">OpenAI</SelectItem>
                                <SelectItem value="anthropic">Anthropic</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="model_name">Model Name</Label>
                          <Input
                            id="model_name"
                            value={configForm.model_name}
                            onChange={(e) => setConfigForm({ ...configForm, model_name: e.target.value })}
                            placeholder="llama-3.1-70b-versatile"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Input
                            id="description"
                            value={configForm.description}
                            onChange={(e) => setConfigForm({ ...configForm, description: e.target.value })}
                            placeholder="Brief description of the AI assistant"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="system_prompt">System Prompt</Label>
                          <Textarea
                            id="system_prompt"
                            value={configForm.system_prompt}
                            onChange={(e) => setConfigForm({ ...configForm, system_prompt: e.target.value })}
                            placeholder="You are an expert trading assistant..."
                            rows={4}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="max_tokens">Max Tokens</Label>
                            <Input
                              id="max_tokens"
                              type="number"
                              value={configForm.max_tokens}
                              onChange={(e) =>
                                setConfigForm({ ...configForm, max_tokens: Number.parseInt(e.target.value) })
                              }
                              min="100"
                              max="4000"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="temperature">Temperature</Label>
                            <Input
                              id="temperature"
                              type="number"
                              step="0.1"
                              value={configForm.temperature}
                              onChange={(e) =>
                                setConfigForm({ ...configForm, temperature: Number.parseFloat(e.target.value) })
                              }
                              min="0"
                              max="2"
                            />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="is_active"
                            checked={configForm.is_active}
                            onCheckedChange={(checked) => setConfigForm({ ...configForm, is_active: checked })}
                          />
                          <Label htmlFor="is_active">Active</Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveConfig}>{editingConfig ? "Update" : "Create"}</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aiConfigs.map((config) => (
                      <TableRow key={config.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Bot className="h-8 w-8 text-purple-600" />
                            <div>
                              <div className="font-medium">{config.name}</div>
                              <div className="text-sm text-muted-foreground">{config.description}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{config.model_provider}</div>
                            <div className="text-sm text-muted-foreground">{config.model_name}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={config.is_active ? "default" : "secondary"}>
                            {config.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(config.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditConfig(config)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteConfig(config.id)} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

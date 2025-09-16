"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Plus, GripVertical, DollarSign, BarChart3, Activity, Newspaper, Bot, BookOpen, Target, X } from "lucide-react"
import { sharedDataStore } from "@/lib/shared-data-store"
import { createClient } from "@/lib/supabase/client"

interface DashboardCard {
  id: string
  title: string
  type: string
  workspace: "trading" | "research" | "shared"
  icon: any
  content: React.ReactNode
}

function SortableCard({ card, onRemove }: { card: DashboardCard; onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const Icon = card.icon

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Icon className="h-4 w-4 text-blue-400" />
              {card.title}
              <Badge variant="outline" className="text-xs">
                {card.workspace}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6 text-gray-400 hover:text-red-400"
                onClick={() => onRemove(card.id)}
              >
                <X className="h-3 w-3" />
              </Button>
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-white"
              >
                <GripVertical className="h-4 w-4" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">{card.content}</CardContent>
      </Card>
    </div>
  )
}

interface CustomizableHomeProps {
  userId?: string
}

export default function CustomizableHome({ userId: propUserId }: CustomizableHomeProps) {
  const [userId, setUserId] = useState<string | null>(null)
  const [sharedData, setSharedData] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const initializeUser = async () => {
      if (propUserId) {
        setUserId(propUserId)
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          setUserId(user.id)
        } else {
          setUserId("demo-user") // Fallback for development
        }
      }
    }

    initializeUser()
  }, [propUserId, supabase.auth])

  useEffect(() => {
    if (userId) {
      const unsubscribe = sharedDataStore.subscribe(userId, (data) => {
        setSharedData(data)
      })

      // Load initial data
      const initialData = sharedDataStore.getUserData(userId)
      if (initialData) {
        setSharedData(initialData)
      } else {
        // Initialize with default data
        sharedDataStore.syncWithKnowledgeBase(userId)
        setSharedData(sharedDataStore.getUserData(userId))
      }

      return unsubscribe
    }
  }, [userId])

  const getActiveCards = (): DashboardCard[] => {
    if (!sharedData) return []

    return [
      {
        id: "portfolio",
        title: "Portfolio Value",
        type: "portfolio",
        workspace: "trading",
        icon: DollarSign,
        content: (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">${sharedData.sandboxData.portfolioValue.toLocaleString()}</p>
              <p className="text-sm text-gray-300">+2.4% today</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-400" />
          </div>
        ),
      },
      {
        id: "positions",
        title: "Active Positions",
        type: "positions",
        workspace: "trading",
        icon: BarChart3,
        content: (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{sharedData.sandboxData.positions.length}</p>
              <p className="text-sm text-gray-300">Open positions</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-400" />
          </div>
        ),
      },
      {
        id: "watchlist",
        title: "Watchlist",
        type: "watchlist",
        workspace: "shared",
        icon: Target,
        content: (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
              {sharedData.sandboxData.watchlist.slice(0, 4).map((symbol: string) => (
                <Badge key={symbol} variant="outline" className="text-xs">
                  {symbol}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-gray-400">{sharedData.sandboxData.watchlist.length} symbols</p>
          </div>
        ),
      },
      {
        id: "ai-assistant",
        title: "AI Assistant",
        type: "ai",
        workspace: "research",
        icon: Bot,
        content: (
          <div className="space-y-2">
            <p className="text-sm text-gray-300">Ready to help with trading analysis</p>
            <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
              Ask AI
            </Button>
          </div>
        ),
      },
    ]
  }

  const [activeCards, setActiveCards] = useState<DashboardCard[]>([])

  useEffect(() => {
    if (sharedData) {
      setActiveCards(getActiveCards())
    }
  }, [sharedData])

  const availableCards: DashboardCard[] = [
    {
      id: "market-status",
      title: "Market Status",
      type: "market",
      workspace: "trading",
      icon: Activity,
      content: (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-white">Market Open</p>
            <p className="text-sm text-gray-300">NYSE • NASDAQ</p>
          </div>
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
        </div>
      ),
    },
    {
      id: "positions",
      title: "Active Positions",
      type: "positions",
      workspace: "trading",
      icon: BarChart3,
      content: (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-white">5</p>
            <p className="text-sm text-gray-300">Open positions</p>
          </div>
          <BarChart3 className="h-8 w-8 text-blue-400" />
        </div>
      ),
    },
    {
      id: "trending-news",
      title: "Trending News",
      type: "news",
      workspace: "shared",
      icon: Newspaper,
      content: (
        <div className="space-y-2">
          <p className="text-sm text-gray-300">Fed announces rate decision</p>
          <p className="text-xs text-gray-400">2 minutes ago</p>
        </div>
      ),
    },
    {
      id: "knowledge-base",
      title: "Knowledge Base",
      type: "knowledge",
      workspace: "research",
      icon: BookOpen,
      content: (
        <div className="space-y-2">
          <p className="text-sm text-gray-300">1,247 insights stored</p>
          <Button size="sm" variant="outline" className="w-full bg-transparent">
            Browse
          </Button>
        </div>
      ),
    },
    {
      id: "training-progress",
      title: "Training Progress",
      type: "training",
      workspace: "research",
      icon: Target,
      content: (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Progress</span>
            <span className="text-white">67%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: "67%" }} />
          </div>
        </div>
      ),
    },
  ]

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setActiveCards((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }, [])

  const addCard = (card: DashboardCard) => {
    if (!activeCards.find((c) => c.id === card.id)) {
      setActiveCards([...activeCards, card])
    }
  }

  const removeCard = (cardId: string) => {
    setActiveCards(activeCards.filter((card) => card.id !== cardId))
  }

  if (!userId || !sharedData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-white">Loading sandbox...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Sandbox</h1>
          <p className="text-gray-400">
            Shared data across all workspaces • Last updated: {sharedData.lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Card
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>Add Dashboard Card</DialogTitle>
              <DialogDescription className="text-gray-400">
                Choose cards to add to your customizable dashboard
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-96">
              <div className="grid grid-cols-1 gap-3">
                {availableCards
                  .filter((card) => !activeCards.find((c) => c.id === card.id))
                  .map((card) => {
                    const Icon = card.icon
                    return (
                      <div
                        key={card.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-700 border border-gray-600"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-blue-400" />
                          <div>
                            <p className="font-medium text-white">{card.title}</p>
                            <p className="text-sm text-gray-400">From {card.workspace}</p>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => addCard(card)} className="bg-blue-600 hover:bg-blue-700">
                          Add
                        </Button>
                      </div>
                    )
                  })}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dashboard Cards */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={activeCards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeCards.map((card) => (
              <SortableCard key={card.id} card={card} onRemove={removeCard} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {activeCards.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">No cards added yet</p>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700 bg-transparent">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Card
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle>Add Dashboard Card</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Choose cards to add to your customizable dashboard
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-96">
                <div className="grid grid-cols-1 gap-3">
                  {availableCards.map((card) => {
                    const Icon = card.icon
                    return (
                      <div
                        key={card.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-700 border border-gray-600"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-blue-400" />
                          <div>
                            <p className="font-medium text-white">{card.title}</p>
                            <p className="text-sm text-gray-400">From {card.workspace}</p>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => addCard(card)} className="bg-blue-600 hover:bg-blue-700">
                          Add
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  )
}

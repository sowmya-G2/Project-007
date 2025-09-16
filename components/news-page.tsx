"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Newspaper, RefreshCw, Search, Filter } from "lucide-react"
import { useMarketNews } from "@/hooks/use-market-data"

export default function NewsPage() {
  const [watchlist] = useState<string[]>(["AAPL", "GOOGL", "TSLA", "MSFT", "NVDA"])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSymbol, setSelectedSymbol] = useState("all")
  const [sentimentFilter, setSentimentFilter] = useState("all")

  const { data: newsData, loading: newsLoading, refetch: refetchNews } = useMarketNews(watchlist, 20)

  const filteredNews = newsData.filter((news) => {
    const matchesSearch =
      searchTerm === "" ||
      news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      news.summary.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSymbol = selectedSymbol === "all" || news.symbols.includes(selectedSymbol)

    const matchesSentiment = sentimentFilter === "all" || news.sentiment === sentimentFilter

    return matchesSearch && matchesSymbol && matchesSentiment
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Market News</h1>
          <p className="text-gray-400">Latest market news and analysis</p>
        </div>
        <Button
          onClick={refetchNews}
          variant="outline"
          className="border-gray-600 text-white hover:bg-gray-700 bg-transparent"
          disabled={newsLoading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${newsLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Filter className="h-5 w-5 text-blue-400" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search news..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Symbol</label>
              <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Symbols</SelectItem>
                  {watchlist.map((symbol) => (
                    <SelectItem key={symbol} value={symbol}>
                      {symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Sentiment</label>
              <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sentiment</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* News Feed */}
      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <Newspaper className="h-5 w-5 text-blue-400" />
              News Feed ({filteredNews.length} articles)
            </CardTitle>
            {newsLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {filteredNews.map((news) => (
                <div key={news.id} className="p-4 rounded-lg bg-gray-700 border border-gray-600">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {news.symbols.map((symbol) => (
                        <Badge
                          key={symbol}
                          variant={
                            news.sentiment === "positive"
                              ? "default"
                              : news.sentiment === "negative"
                                ? "destructive"
                                : "secondary"
                          }
                          className="text-xs"
                        >
                          {symbol}
                        </Badge>
                      ))}
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          news.sentiment === "positive"
                            ? "text-green-400 border-green-400"
                            : news.sentiment === "negative"
                              ? "text-red-400 border-red-400"
                              : "text-gray-400 border-gray-400"
                        }`}
                      >
                        {news.sentiment}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">{news.source}</p>
                      <p className="text-xs text-gray-400">{new Date(news.publishedAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-white">{news.title}</h3>
                  <p className="text-gray-300 mb-3">{news.summary}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Impact: {news.impact}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Relevance: {news.relevance}%
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-blue-400 border-blue-400 hover:bg-blue-400/10 bg-transparent"
                    >
                      Read More
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

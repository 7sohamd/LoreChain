"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Search, Filter, Check, X, Eye, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { CanonStatusBadge } from "@/components/canon-status-badge"

const mockPendingEntries = [
  {
    id: "3",
    title: "The Ethereal Codex",
    excerpt: "A living document that rewrites itself based on the collective unconscious of nearby sentient beings...",
    author: "0x1c7b...44Af",
    type: "Object",
    votes: 23,
    upvotes: 18,
    downvotes: 5,
    aiGenerated: false,
    submittedAt: "2024-02-15T10:30:00Z",
    flagged: false,
  },
  {
    id: "4",
    title: "Zara the Quantum Thief",
    excerpt: "A legendary figure who can steal not just objects, but concepts, memories, and even possibilities...",
    author: "0x9d2e...77Cc",
    type: "Character",
    votes: 45,
    upvotes: 32,
    downvotes: 13,
    aiGenerated: true,
    submittedAt: "2024-02-14T15:45:00Z",
    flagged: false,
  },
  {
    id: "6",
    title: "The Memory Markets",
    excerpt: "Underground bazaars where experiences, skills, and memories are traded like commodities...",
    author: "0x6b4c...88Ee",
    type: "Place",
    votes: 67,
    upvotes: 51,
    downvotes: 16,
    aiGenerated: true,
    submittedAt: "2024-02-13T09:20:00Z",
    flagged: true,
  },
]

const mockCanonEntries = [
  {
    id: "1",
    title: "The Nexus Convergence",
    author: "0x742d...35Bc",
    type: "Event",
    votes: 127,
    canonizedAt: "2024-01-22T14:45:00Z",
    canonizedBy: "admin",
  },
  {
    id: "2",
    title: "House Voidwhisper",
    author: "0x8f3a...91De",
    type: "Faction",
    votes: 89,
    canonizedAt: "2024-01-25T11:30:00Z",
    canonizedBy: "community",
  },
]

export default function AdminPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("pending")

  const handleApprove = (id: string) => {
    console.log("Approving entry:", id)
    // Handle approval logic
  }

  const handleReject = (id: string) => {
    console.log("Rejecting entry:", id)
    // Handle rejection logic
  }

  const filteredPendingEntries = mockPendingEntries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || entry.type.toLowerCase() === typeFilter
    return matchesSearch && matchesType
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-red-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-slate-300 text-lg">
            Manage lore submissions and community content
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-400">{mockPendingEntries.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Canon Entries</p>
                  <p className="text-2xl font-bold text-green-400">{mockCanonEntries.length}</p>
                </div>
                <Check className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Flagged Content</p>
                  <p className="text-2xl font-bold text-red-400">
                    {mockPendingEntries.filter(e => e.flagged).length}
                  </p>
                </div>
                <X className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Votes</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {mockPendingEntries.reduce((sum, entry) => sum + entry.votes, 0)}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Content Management</CardTitle>
            <CardDescription className="text-slate-300">
              Review and manage community submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-slate-700 mb-6">
                <TabsTrigger value="pending" className="data-[state=active]:bg-yellow-600">
                  Pending Review ({mockPendingEntries.length})
                </TabsTrigger>
                <TabsTrigger value="canon" className="data-[state=active]:bg-green-600">
                  Canon Entries ({mockCanonEntries.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-6">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search pending entries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="character">Character</SelectItem>
                        <SelectItem value="place">Place</SelectItem>
                        <SelectItem value="faction">Faction</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="object">Object</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Pending Entries */}
                <div className="space-y-4">
                  {filteredPendingEntries.map((entry) => (
                    <Card key={entry.id} className={`bg-slate-700/50 border-slate-600 ${entry.flagged ? 'border-red-500/50' : ''}`}>
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-white font-semibold text-lg">{entry.title}</h3>
                                <Badge variant="secondary" className="bg-slate-600 text-slate-300">
                                  {entry.type}
                                </Badge>
                                {entry.aiGenerated && (
                                  <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                                    AI-Assisted
                                  </Badge>
                                )}
                                {entry.flagged && (
                                  <Badge variant="outline" className="border-red-500/50 text-red-400">
                                    Flagged
                                  </Badge>
                                )}
                              </div>
                              <p className="text-slate-300 text-sm leading-relaxed">
                                {entry.excerpt}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-slate-400">
                                <span>by {entry.author}</span>
                                <span>Submitted: {new Date(entry.submittedAt).toLocaleDateString()}</span>
                                <span className="text-green-400">↑ {entry.upvotes}</span>
                                <span className="text-red-400">↓ {entry.downvotes}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button asChild variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-600">
                                <Link href={`/lore/${entry.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Review
                                </Link>
                              </Button>
                              <Button
                                onClick={() => handleApprove(entry.id)}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Check className="mr-2 h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleReject(entry.id)}
                                variant="outline"
                                size="sm"
                                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                              >
                                <X className="mr-2 h-4 w-4" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="canon" className="space-y-4">
                {mockCanonEntries.map((entry) => (
                  <Card key={entry.id} className="bg-slate-700/50 border-green-500/30">
                    <CardContent className\` className="bg-slate-700/50 border-green-500/30">
                    <CardContent className="p-4">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-white font-semibold">{entry.title}</h3>
                            <Badge variant="secondary" className="bg-slate-600 text-slate-300">
                              {entry.type}
                            </Badge>
                            <CanonStatusBadge isCanon={true} />
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <span>by {entry.author}</span>
                            <span>Canonized: {new Date(entry.canonizedAt).toLocaleDateString()}</span>
                            <span>Method: {entry.canonizedBy === 'admin' ? 'Admin Approval' : 'Community Vote'}</span>
                            <span>{entry.votes} votes</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button asChild variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-600">
                            <Link href={`/lore/${entry.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" className="border-green-500/50 text-green-400 hover:bg-green-500/10">
                            View on Chain
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

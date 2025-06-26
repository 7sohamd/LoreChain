"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Trophy, Scroll, LogOut, ExternalLink } from "lucide-react"
import Link from "next/link"
import { CanonStatusBadge } from "@/components/canon-status-badge"

const mockUserData = {
  address: "0x742d35Bc8f3a91De1c7b44Af",
  joinDate: "2024-01-10",
  totalSubmissions: 12,
  canonEntries: 5,
  totalVotes: 847,
  reputation: 1250,
}

const mockSubmissions = [
  {
    id: "1",
    title: "The Nexus Convergence",
    type: "Event",
    isCanon: true,
    votes: 127,
    createdAt: "2024-01-15",
    canonizedAt: "2024-01-22",
  },
  {
    id: "2",
    title: "The Quantum Gardens",
    type: "Place",
    isCanon: true,
    votes: 89,
    createdAt: "2024-01-20",
    canonizedAt: "2024-01-28",
  },
  {
    id: "3",
    title: "Captain Zara Nightfall",
    type: "Character",
    isCanon: false,
    votes: 34,
    createdAt: "2024-02-01",
  },
  {
    id: "4",
    title: "The Memory Thieves Guild",
    type: "Faction",
    isCanon: true,
    votes: 156,
    createdAt: "2024-02-05",
    canonizedAt: "2024-02-12",
  },
  {
    id: "5",
    title: "The Singing Crystals",
    type: "Object",
    isCanon: false,
    votes: 67,
    createdAt: "2024-02-10",
  },
]

export default function MyLorePage() {
  const [activeTab, setActiveTab] = useState("all")

  const filteredSubmissions = mockSubmissions.filter((submission) => {
    if (activeTab === "all") return true
    if (activeTab === "canon") return submission.isCanon
    if (activeTab === "pending") return !submission.isCanon
    return true
  })

  const handleLogout = () => {
    // Handle logout logic
    console.log("Logging out...")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
            My Lore
          </h1>
          <p className="text-slate-300 text-lg">Track your contributions to the universe</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-slate-400">Wallet Address</p>
                  <p className="text-white font-mono text-sm break-all">{mockUserData.address}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Member Since</p>
                  <p className="text-white">{new Date(mockUserData.joinDate).toLocaleDateString()}</p>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Disconnect
                </Button>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-400" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Submissions</span>
                  <span className="text-white font-semibold">{mockUserData.totalSubmissions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Canon Entries</span>
                  <span className="text-green-400 font-semibold">{mockUserData.canonEntries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Votes</span>
                  <span className="text-purple-400 font-semibold">{mockUserData.totalVotes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Reputation</span>
                  <span className="text-yellow-400 font-semibold">{mockUserData.reputation}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                  <Link href="/write">
                    <Scroll className="mr-2 h-4 w-4" />
                    Write New Lore
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                  <Link href="/lore">Browse All Lore</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">My Submissions</CardTitle>
                <CardDescription className="text-slate-300">
                  All your lore contributions and their current status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="bg-slate-700 mb-6">
                    <TabsTrigger value="all" className="data-[state=active]:bg-purple-600">
                      All ({mockSubmissions.length})
                    </TabsTrigger>
                    <TabsTrigger value="canon" className="data-[state=active]:bg-green-600">
                      Canon ({mockSubmissions.filter((s) => s.isCanon).length})
                    </TabsTrigger>
                    <TabsTrigger value="pending" className="data-[state=active]:bg-yellow-600">
                      Pending ({mockSubmissions.filter((s) => !s.isCanon).length})
                    </TabsTrigger>
                  </TabsList>

                  <div className="space-y-4">
                    {filteredSubmissions.map((submission) => (
                      <Card
                        key={submission.id}
                        className="bg-slate-700/50 border-slate-600 hover:border-purple-500/50 transition-colors"
                      >
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h3 className="text-white font-semibold">{submission.title}</h3>
                                <Badge variant="secondary" className="bg-slate-600 text-slate-300">
                                  {submission.type}
                                </Badge>
                                <CanonStatusBadge isCanon={submission.isCanon} />
                              </div>
                              <div className="flex items-center gap-4 text-sm text-slate-400">
                                <span>Created: {new Date(submission.createdAt).toLocaleDateString()}</span>
                                {submission.canonizedAt && (
                                  <span className="text-green-400">
                                    Canonized: {new Date(submission.canonizedAt).toLocaleDateString()}
                                  </span>
                                )}
                                <span>{submission.votes} votes</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="border-slate-600 text-slate-300 hover:bg-slate-600"
                              >
                                <Link href={`/lore/${submission.id}`}>View Entry</Link>
                              </Button>
                              {submission.isCanon && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {filteredSubmissions.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-slate-400 mb-4">No submissions found in this category.</p>
                      <Button asChild className="bg-purple-600 hover:bg-purple-700">
                        <Link href="/write">Create Your First Lore Entry</Link>
                      </Button>
                    </div>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Trophy, Scroll, LogOut, ExternalLink } from "lucide-react"
import Link from "next/link"
import { CanonStatusBadge } from "@/components/canon-status-badge"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth"
import { collection, query, where, getDocs } from "firebase/firestore"
import { Avatar } from "@/components/ui/avatar"

export default function MyLorePage() {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [myStories, setMyStories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Helper to get preview text (first 300 chars or 6 lines)
  function getPreview(text: string) {
    const lines = text.split("\n");
    if (lines.length > 6) {
      return lines.slice(0, 6).join("\n") + "...";
    }
    if (text.length > 300) {
      return text.slice(0, 300) + "...";
    }
    return text;
  }
  const [expandedStories, setExpandedStories] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser)
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) {
      setMyStories([])
      setLoading(false)
      return
    }
    const fetchMyStories = async () => {
      const q = query(collection(db, "stories"), where("authorId", "==", user.uid))
      const querySnapshot = await getDocs(q)
      setMyStories(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      setLoading(false)
    }
    fetchMyStories()
  }, [user])

  if (loading) return <div className="text-center py-12 text-slate-300">Loading...</div>
  if (!user) return <div className="text-center py-12 text-slate-300">Please sign in to view your stories.</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 py-8 pt-24">
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
                <div className="flex flex-col items-center gap-2 mb-4">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || user.email || "User"}
                      className="w-20 h-20 rounded-full object-cover border-4 border-purple-500 shadow"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center text-3xl text-white font-bold">
                      {user.displayName ? user.displayName[0] : (user.email ? user.email[0] : "U")}
                    </div>
                  )}
                  <div className="text-lg font-bold text-white">{user.displayName || user.email}</div>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Email</p>
                  <p className="text-white font-mono text-sm break-all">{user.email}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
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
                  <span className="text-white font-semibold">{myStories.length}</span>
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
                {myStories.length === 0 ? (
                  <div className="text-slate-400">You haven't submitted any stories yet.</div>
                ) : (
                  <div className="space-y-6">
                    {myStories.map((story) => (
                      <div key={story.id} className="bg-slate-800/50 border-slate-700 rounded-lg p-6">
                        <h2 className="text-xl font-bold text-white mb-2">{story.title}</h2>
                        <div className="text-slate-300 mb-2">{story.category}</div>
                        <div className="text-slate-200 whitespace-pre-line mb-2">
                          {expandedStories[story.id] ? story.content : getPreview(story.content)}
                          {(story.content.length > 300 || story.content.split("\n").length > 6) && (
                            <button
                              className="ml-2 text-purple-400 hover:underline text-xs"
                              onClick={() => setExpandedStories(prev => ({ ...prev, [story.id]: !prev[story.id] }))}
                            >
                              {expandedStories[story.id] ? "See less" : "See more"}
                            </button>
                          )}
                        </div>
                        <div className="text-sm text-slate-400">Upvotes: {story.upvotes?.length || 0} | Downvotes: {story.downvotes?.length || 0}</div>
                        {story.isMain && <div className="text-green-400 font-bold mt-2">MAIN STORY</div>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

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

  if (loading) return <div className="text-center py-12" style={{ color: '#5c4a1a', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>Loading...</div>
  if (!user) return <div className="text-center py-12" style={{ color: '#5c4a1a', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>Please sign in to view your stories.</div>

  return (
    <div className="min-h-screen w-full py-8 pt-24" style={{ background: '#fff9de' }}>
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#3d2c00' }}>
            My Lore
          </h1>
          <p className="text-lg" style={{ color: '#5c4a1a', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>Track your contributions to the universe</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border" style={{ background: '#fff9de', border: '1px solid #ffb300' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: '#3d2c00' }}>
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
                      className="w-20 h-20 rounded-full object-cover border-4 shadow"
                      style={{ borderColor: '#ffb300' }}
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold" style={{ background: '#ffb300', color: '#3d2c00' }}>
                      {user.displayName ? user.displayName[0] : (user.email ? user.email[0] : "U")}
                    </div>
                  )}
                  <div className="text-lg font-bold" style={{ color: '#3d2c00' }}>{user.displayName || user.email}</div>
                </div>
                <div>
                  <p className="text-sm" style={{ color: '#5c4a1a', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>Email</p>
                  <p className="font-mono text-sm break-all" style={{ color: '#3d2c00' }}>{user.email}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-[#ffb300] bg-[#fff9de] text-[#3d2c00] hover:bg-[#ffd966] font-bold"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="border" style={{ background: '#fff9de', border: '1px solid #ffb300' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: '#3d2c00' }}>
                  <Trophy className="h-5 w-5" style={{ color: '#ffb300' }} />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span style={{ color: '#5c4a1a', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>Total Submissions</span>
                  <span className="font-semibold" style={{ color: '#3d2c00' }}>{myStories.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border" style={{ background: '#fff9de', border: '1px solid #ffb300' }}>
              <CardHeader>
                <CardTitle className="text-lg" style={{ color: '#3d2c00' }}>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full bg-[#ffb300] text-[#3d2c00] hover:bg-[#ffd966] border-none font-bold shadow-none">
                  <Link href="/write">
                    <Scroll className="mr-2 h-4 w-4" />
                    Write New Lore
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full border-[#ffb300] bg-[#fff9de] text-[#3d2c00] hover:bg-[#ffd966] font-bold">
                  <Link href="/lore">Browse All Lore</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="border" style={{ background: '#fff9de', border: '1px solid #ffb300' }}>
              <CardHeader>
                <CardTitle style={{ color: '#3d2c00' }}>My Submissions</CardTitle>
                <CardDescription style={{ color: '#5c4a1a', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>
                  All your lore contributions and their current status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {myStories.length === 0 ? (
                  <div style={{ color: '#5c4a1a', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>You haven't submitted any stories yet.</div>
                ) : (
                  <div className="space-y-6">
                    {myStories.map((story) => (
                      <div key={story.id} className="rounded-lg p-6" style={{ background: '#fff9de', border: '1px solid #ffb300' }}>
                        <h2 className="text-xl font-bold mb-2" style={{ color: '#3d2c00' }}>{story.title}</h2>
                        <div className="mb-2" style={{ color: '#5c4a1a', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>{story.category}</div>
                        <div className="whitespace-pre-line mb-2" style={{ color: '#5c4a1a', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>
                          {expandedStories[story.id] ? story.content : getPreview(story.content)}
                          {(story.content.length > 300 || story.content.split("\n").length > 6) && (
                            <button
                              className="ml-2 text-xs font-bold"
                              style={{ color: '#3d2c00' }}
                              onClick={() => setExpandedStories(prev => ({ ...prev, [story.id]: !prev[story.id] }))}
                            >
                              {expandedStories[story.id] ? "See less" : "See more"}
                            </button>
                          )}
                        </div>
                        <div className="text-sm" style={{ color: '#bfa76a', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>Upvotes: {story.upvotes?.length || 0} | Downvotes: {story.downvotes?.length || 0}</div>
                        {story.isMain && <div className="font-bold mt-2" style={{ color: '#1a7f37' }}>MAIN STORY</div>}
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

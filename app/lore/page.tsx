"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter } from "lucide-react"
import { LoreCard } from "@/components/lore-card"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth"
import { collection, getDocs, updateDoc, doc, query, where, getDoc } from "firebase/firestore"

export default function LorePage() {
  const [stories, setStories] = useState<any[]>([])
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser)
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const fetchStories = async () => {
      const q = query(collection(db, "stories"))
      const querySnapshot = await getDocs(q)
      setStories(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      setLoading(false)
    }
    fetchStories()
  }, [])

  const handleVote = async (storyId: string, type: "up" | "down") => {
    if (!user) {
      alert("Please sign in to vote.")
      return
    }
    const storyRef = doc(db, "stories", storyId)
    const storySnap = await getDoc(storyRef)
    if (!storySnap.exists()) return
    const story = storySnap.data()
    const upvotes: string[] = story.upvotes || []
    const downvotes: string[] = story.downvotes || []
    if (upvotes.includes(user.uid) || downvotes.includes(user.uid)) {
      alert("You have already voted on this story.")
      return
    }
    if (type === "up") upvotes.push(user.uid)
    else downvotes.push(user.uid)
    await updateDoc(storyRef, { upvotes, downvotes })
    // If upvotes >= 5 and not main, mark as main and set parentMainId
    if (upvotes.length >= 5 && !story.isMain) {
      // Find current main story
      const mainQ = query(collection(db, "stories"), where("isMain", "==", true))
      const mainSnap = await getDocs(mainQ)
      let parentMainId = null
      if (!mainSnap.empty) parentMainId = mainSnap.docs[0].id
      await updateDoc(storyRef, { isMain: true, parentMainId })
      // Optionally, set previous main's isMain to false if you want only one main
      if (!mainSnap.empty) {
        await updateDoc(doc(db, "stories", mainSnap.docs[0].id), { isMain: false })
      }
    }
    // Refresh stories
    const q = query(collection(db, "stories"))
    const querySnapshot = await getDocs(q)
    setStories(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
  }

  if (loading) return <div className="text-center py-12 text-slate-300">Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Lore Archive
          </h1>
          <p className="text-slate-300 text-lg">Explore the ever-growing universe of collaborative storytelling</p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search lore entries..."
                className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <Select>
                <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
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

          <Tabs className="w-full">
            <TabsList className="bg-slate-800 border-slate-700">
              <TabsTrigger value="all" className="data-[state=active]:bg-purple-600">
                All ({stories.length})
              </TabsTrigger>
              <TabsTrigger value="canon" className="data-[state=active]:bg-green-600">
                Canon ({stories.filter((e) => e.isMain).length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="data-[state=active]:bg-yellow-600">
                Pending ({stories.filter((e) => !e.isMain).length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Lore Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((entry) => (
            <div key={entry.id} className="flex flex-col gap-2">
              <LoreCard
                entry={{
                  id: entry.id,
                  title: entry.title,
                  excerpt: entry.content.slice(0, 120) + (entry.content.length > 120 ? "..." : ""),
                  author: entry.authorName,
                  type: entry.category,
                  isCanon: entry.isMain,
                  votes: (entry.upvotes?.length || 0) - (entry.downvotes?.length || 0),
                  aiGenerated: false,
                }}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVote(entry.id, "up")}
                  disabled={!user || (entry.upvotes?.includes(user?.uid) || entry.downvotes?.includes(user?.uid))}
                >
                  Upvote ({entry.upvotes?.length || 0})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVote(entry.id, "down")}
                  disabled={!user || (entry.upvotes?.includes(user?.uid) || entry.downvotes?.includes(user?.uid))}
                >
                  Downvote ({entry.downvotes?.length || 0})
                </Button>
                {entry.isMain && (
                  <span className="ml-2 text-green-400 font-bold">MAIN STORY</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {stories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">No lore entries yet.</p>
            <Button asChild className="mt-4 bg-purple-600 hover:bg-purple-700">
              <a href="/write">Create New Lore</a>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

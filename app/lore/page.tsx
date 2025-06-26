"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter } from "lucide-react"
import { LoreCard } from "@/components/lore-card"
import { auth, db, getUserWalletAddress } from "@/lib/firebase"
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth"
import { collection, getDocs, updateDoc, doc, query, getDoc } from "firebase/firestore"

export default function LorePage() {
  const [lores, setLores] = useState<any[]>([])
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [wallets, setWallets] = useState<{ [uid: string]: string | null }>({})
  const [search, setSearch] = useState("")

  // Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser)
    return () => unsubscribe()
  }, [])

  // Fetch lores from Firestore
  useEffect(() => {
    async function fetchLores() {
      setLoading(true)
      const q = query(collection(db, "stories"))
      const querySnapshot = await getDocs(q)
      setLores(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      setLoading(false)
    }
    fetchLores()
  }, [])

  // Fetch wallet addresses for authors
  useEffect(() => {
    if (lores.length === 0) return
    async function fetchWallets() {
      const walletMap: { [uid: string]: string | null } = {}
      await Promise.all(lores.map(async (entry) => {
        if (entry.authorId && !walletMap[entry.authorId]) {
          walletMap[entry.authorId] = await getUserWalletAddress(entry.authorId)
        }
      }))
      setWallets(walletMap)
    }
    fetchWallets()
  }, [lores])

  // Voting handler
  const handleVote = async (loreId: string, type: "up" | "down") => {
    if (!user) {
      alert("Please sign in to vote.")
      return
    }
    const loreRef = doc(db, "stories", loreId)
    const loreSnap = await getDoc(loreRef)
    if (!loreSnap.exists()) return
    const lore = loreSnap.data()
    const upvotes: string[] = lore.upvotes || []
    const downvotes: string[] = lore.downvotes || []
    if (upvotes.includes(user.uid) || downvotes.includes(user.uid)) {
      alert("You have already voted on this lore.")
      return
    }
    if (type === "up") upvotes.push(user.uid)
    else downvotes.push(user.uid)
    await updateDoc(loreRef, { upvotes, downvotes })
    // Refresh lores
    const q = query(collection(db, "stories"))
    const querySnapshot = await getDocs(q)
    setLores(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
  }

  if (loading) return <div className="text-center py-12 text-slate-300">Loading...</div>

  // Show all stories
  const filteredLores = lores.filter(entry => {
    if (!search.trim()) return true;
    const s = search.trim().toLowerCase();
    return (
      (entry.title && entry.title.toLowerCase().includes(s)) ||
      (entry.content && entry.content.toLowerCase().includes(s)) ||
      (entry.category && entry.category.toLowerCase().includes(s))
    );
  });

  // Calculate trending story (most continuations)
  const continuationCounts: { [id: string]: number } = {};
  lores.forEach(story => {
    if (story.parentMainId) {
      continuationCounts[story.parentMainId] = (continuationCounts[story.parentMainId] || 0) + 1;
    }
  });
  const trendingStoryId = Object.entries(continuationCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Lore Archive
          </h1>
          <p className="text-slate-300 text-lg">Explore the ever-growing universe of collaborative storytelling</p>
        </div>

        {/* Search and filter UI (not implemented, just UI) */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search lore entries..."
                className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <Tabs className="w-full">
            <TabsList className="bg-slate-800 border-slate-700">
              <TabsTrigger value="all" className="data-[state=active]:bg-purple-600">
                All ({filteredLores.length})
              </TabsTrigger>
              <TabsTrigger value="canon" className="data-[state=active]:bg-green-600">
                Canon ({filteredLores.filter((e) => e.isMain).length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="data-[state=active]:bg-yellow-600">
                Pending ({filteredLores.filter((e) => !e.isMain).length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLores.map((entry) => {
            const hasUpvoted = !!user && entry.upvotes?.includes(user.uid)
            const hasDownvoted = !!user && entry.downvotes?.includes(user.uid)
            return (
              <div key={entry.id} className="flex flex-col gap-2">
                <LoreCard
                  entry={{
                    id: entry.id,
                    title: entry.title,
                    excerpt: entry.content?.slice(0, 120) + (entry.content?.length > 120 ? "..." : ""),
                    author: entry.authorName,
                    type: entry.category,
                    isCanon: entry.isMain,
                    votes: Math.max((entry.upvotes?.length || 0) - (entry.downvotes?.length || 0), 0),
                    aiGenerated: false,
                    authorWallet: entry.authorId ? wallets[entry.authorId] : null,
                    upvotes: entry.upvotes || [],
                    downvotes: entry.downvotes || [],
                    imageUrl: entry.imageUrl && entry.imageUrl.trim() !== "" ? entry.imageUrl : undefined,
                  }}
                  onVote={type => handleVote(entry.id, type)}
                  hasUpvoted={hasUpvoted}
                  hasDownvoted={hasDownvoted}
                />
                {entry.id === trendingStoryId && (
                  <span className="ml-2 text-pink-400 font-bold">TRENDING</span>
                )}
              </div>
            )
          })}
        </div>

        {filteredLores.length === 0 && (
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
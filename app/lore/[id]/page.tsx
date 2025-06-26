"use client"

import { use, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Share2, ExternalLink, ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"
import { VoteButton } from "@/components/vote-button"
import { CanonStatusBadge } from "@/components/canon-status-badge"
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth"

export default function EntryPage({ params }: { params: any }) {
  const { id } = use(params)
  const [story, setStory] = useState<any>(null)
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser)
    return () => unsubscribe()
  }, [])
  
  const fetchStory = async () => {
    if (!id) return
    const storyRef = doc(db, "stories", id)
    const storySnap = await getDoc(storyRef)

    if (storySnap.exists()) {
      setStory({ id: storySnap.id, ...storySnap.data() })
    } else {
      console.log("No such document!")
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchStory()
  }, [id])

  const handleVote = async (storyId: string, type: "up" | "down") => {
    if (!user) {
      alert("Please sign in to vote.")
      return
    }
    const storyRef = doc(db, "stories", storyId)
    const storySnap = await getDoc(storyRef)
    if (!storySnap.exists()) return

    const storyData = storySnap.data()
    const upvotes: string[] = storyData.upvotes || []
    const downvotes: string[] = storyData.downvotes || []

    if (upvotes.includes(user.uid) || downvotes.includes(user.uid)) {
      alert("You have already voted on this story.")
      return
    }

    const newUpvotes = type === "up" ? [...upvotes, user.uid] : upvotes
    const newDownvotes = type === "down" ? [...downvotes, user.uid] : downvotes

    await updateDoc(storyRef, { upvotes: newUpvotes, downvotes: newDownvotes })

    if (newUpvotes.length >= 5 && !storyData.isMain) {
        const mainQuery = query(collection(db, "stories"), where("isMain", "==", true));
        const mainSnapshot = await getDocs(mainQuery);
        let parentId = null;
        if (!mainSnapshot.empty) {
            parentId = mainSnapshot.docs[0].id;
            await updateDoc(doc(db, "stories", parentId), { isMain: false });
        }
        await updateDoc(storyRef, { isMain: true, parentMainId: parentId });
    }

    fetchStory() // Re-fetch the story to update the UI
  }

  if (loading) {
    return <div className="text-center py-12 text-slate-300">Loading story...</div>
  }

  if (!story) {
    return <div className="text-center py-12 text-slate-300">Story not found.</div>
  }

  const upvoteCount = story.upvotes?.length || 0
  const downvoteCount = story.downvotes?.length || 0
  const totalVotes = upvoteCount - downvoteCount
  const hasVoted = user && (story.upvotes?.includes(user.uid) || story.downvotes?.includes(user.uid))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <Button asChild variant="ghost" className="mb-6 text-slate-300 hover:text-white">
          <Link href="/lore">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Lore Archive
          </Link>
        </Button>

        {/* Main Content */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white leading-tight">{story.title}</h1>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                    {story.category}
                  </Badge>
                  <CanonStatusBadge isCanon={story.isMain} />
                  {story.aiGenerated && (
                    <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                      <Sparkles className="mr-1 h-3 w-3" />
                      AI
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                {story.isMain && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on Chain
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Content */}
            <div className="prose prose-invert max-w-none">
              <div className="text-slate-200 leading-relaxed whitespace-pre-wrap text-lg">{story.content}</div>
            </div>

            <Separator className="bg-slate-700" />

            {/* Author & Metadata */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-slate-400">
              <div className="space-y-1">
                <p>
                  Created by <span className="text-purple-400 font-mono">{story.authorName}</span>
                </p>
                <p>Submitted on {new Date(story.createdAt.toDate()).toLocaleDateString()}</p>
                {story.isMain && story.canonizedAt && (
                  <p className="text-green-400">Canonized on {new Date(story.canonizedAt.toDate()).toLocaleDateString()}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-white">{totalVotes} votes</p>
              </div>
            </div>

            {/* Voting Section */}
            {!story.isMain && (
              <>
                <Separator className="bg-slate-700" />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Community Voting</h3>
                  <p className="text-slate-300 text-sm">
                    Help decide if this lore should become part of the official canon. Quality entries that enhance the
                    universe will be approved by community consensus.
                  </p>
                  <div className="flex gap-3">
                    <Button onClick={() => handleVote(story.id, "up")} disabled={!!hasVoted}>Upvote ({upvoteCount})</Button>
                    <Button onClick={() => handleVote(story.id, "down")} disabled={!!hasVoted}>Downvote ({downvoteCount})</Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Related Entries */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">Related Lore</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-slate-800/30 border-slate-700 hover:border-purple-500/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-white text-lg">House Voidwhisper</CardTitle>
                <Badge variant="secondary" className="w-fit bg-slate-700 text-slate-300">
                  Faction
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 text-sm">
                  An ancient faction that claims to hear the voices of the void between stars...
                </p>
                <Button asChild variant="ghost" size="sm" className="mt-2 text-purple-400 hover:text-purple-300 p-0">
                  <Link href="/lore/2">Read More →</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/30 border-slate-700 hover:border-purple-500/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-white text-lg">The Singing Nebula</CardTitle>
                <Badge variant="secondary" className="w-fit bg-slate-700 text-slate-300">
                  Place
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 text-sm">
                  A cosmic phenomenon where stellar gases vibrate at frequencies that create...
                </p>
                <Button asChild variant="ghost" size="sm" className="mt-2 text-purple-400 hover:text-purple-300 p-0">
                  <Link href="/lore/5">Read More →</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"
import { CanonStatusBadge } from "@/components/canon-status-badge"
import {
  doc, getDoc, updateDoc, collection, query, where,
  getDocs, addDoc, deleteDoc, Timestamp
} from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth"

export default function EntryPage({ params }: { params: any }) {
  const { id } = params;
  const [story, setStory] = useState<any>(null)
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [addons, setAddons] = useState<any[]>([])
  const [addonTitle, setAddonTitle] = useState("")
  const [addonContent, setAddonContent] = useState("")
  const [addonSubmitting, setAddonSubmitting] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser)
    return () => unsubscribe()
  }, [])

  const fetchStory = async () => {
    setLoading(true)
    const storyRef = doc(db, "stories", id)
    const storySnap = await getDoc(storyRef)
    if (storySnap.exists()) {
      setStory({ id: storySnap.id, ...storySnap.data() })
    }
    setLoading(false)
  }

  const fetchAddons = async () => {
    const q = query(collection(db, "stories"), where("parentMainId", "==", id))
    const querySnapshot = await getDocs(q)
    const addonsFetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    for (const addon of addonsFetched) {
      if ((addon.upvotes?.length || 0) >= 2) {
        await mergeAddonIntoStory(addon, addonsFetched)
        return // exit loop, only one can be merged
      }
    }

    setAddons(addonsFetched)
  }

  const mergeAddonIntoStory = async (addon: any, allAddons: any[]) => {
    const updatedContent = `${story.content}\n\n---\n\n${addon.title}\n\n${addon.content}\n\n*Contributed by ${addon.authorName}*`
    await updateDoc(doc(db, "stories", id), {
      content: updatedContent
    })

    // Delete all other add-ons
    for (const a of allAddons) {
      if (a.id !== addon.id) {
        await deleteDoc(doc(db, "stories", a.id))
      }
    }

    // Delete merged one too
    await deleteDoc(doc(db, "stories", addon.id))

    // Refresh the main story
    await fetchStory()
    setAddons([]) // reset addons
  }

  useEffect(() => {
    fetchStory()
  }, [id])

  useEffect(() => {
    if (story) {
      fetchAddons()
    }
  }, [story])

  const handleAddonSubmit = async () => {
    if (!user) return alert("Please sign in.")
    if (!addonTitle || !addonContent) return alert("Fill in all fields.")
    setAddonSubmitting(true)
    try {
      await addDoc(collection(db, "stories"), {
        title: addonTitle,
        content: addonContent,
        category: story.category,
        authorId: user.uid,
        authorName: user.displayName || user.email,
        createdAt: Timestamp.now(),
        upvotes: [],
        downvotes: [],
        isMain: false,
        parentMainId: id
      })
      setAddonTitle("")
      setAddonContent("")
      fetchAddons()
    } catch (err) {
      alert("Failed to submit add-on.")
    }
    setAddonSubmitting(false)
  }

  const handleAddonVote = async (addonId: string) => {
    if (!user) return alert("Please sign in.")
    const ref = doc(db, "stories", addonId)
    const snap = await getDoc(ref)
    if (!snap.exists()) return
    const data = snap.data()
    const up = data.upvotes || []
    if (up.includes(user.uid)) return alert("Already voted.")
    const newUp = [...up, user.uid]
    await updateDoc(ref, { upvotes: newUp })
    fetchAddons()
  }

  if (loading) return <div className="text-center py-12 text-slate-300">Loading story...</div>
  if (!story) return <div className="text-center py-12 text-slate-300">Story not found.</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button asChild variant="ghost" className="mb-6 text-slate-300 hover:text-white">
          <Link href="/lore">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Lore Archive
          </Link>
        </Button>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-white">{story.title}</CardTitle>
            <div className="flex gap-2 mt-2">
              <Badge className="bg-slate-700 text-slate-300">{story.category}</Badge>
              <CanonStatusBadge isCanon={true} />
              {story.aiGenerated && (
                <Badge variant="outline" className="text-purple-400 border-purple-400">
                  <Sparkles className="w-3 h-3 mr-1" /> AI
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-slate-200 text-lg whitespace-pre-wrap">{story.content}</div>

            <div>
              <h3 className="text-white text-lg font-semibold mb-2">Add to the Story</h3>
              <input className="w-full mb-2 p-2 rounded bg-slate-700 text-white"
                placeholder="Add-on Title" value={addonTitle}
                onChange={e => setAddonTitle(e.target.value)}
              />
              <textarea className="w-full mb-2 p-2 rounded bg-slate-700 text-white"
                placeholder="Continue the story..." rows={4} value={addonContent}
                onChange={e => setAddonContent(e.target.value)}
              />
              <Button onClick={handleAddonSubmit} disabled={addonSubmitting}>
                {addonSubmitting ? "Submitting..." : "Submit Add-on"}
              </Button>
            </div>

            {addons.length > 0 && (
              <div>
                <h3 className="text-white text-lg font-semibold mb-2">Story Add-ons</h3>
                <div className="space-y-4">
                  {addons.map(a => (
                    <Card key={a.id} className="bg-slate-700/60 border-slate-600">
                      <CardHeader>
                        <CardTitle className="text-white text-base">{a.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-200">{a.content}</p>
                        <div className="flex gap-2 items-center mt-2">
                          <Button size="sm" onClick={() => handleAddonVote(a.id)}>
                            Upvote ({a.upvotes?.length || 0})
                          </Button>
                          <span className="text-xs text-slate-400 ml-2">by {a.authorName}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <Separator className="bg-slate-700 my-6" />

            <div className="text-sm text-slate-400 space-y-1">
              <p>Created by <span className="text-purple-400 font-mono">{story.authorName}</span></p>
              <p>Submitted on {story.createdAt?.toDate ? new Date(story.createdAt.toDate()).toLocaleDateString() : ""}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

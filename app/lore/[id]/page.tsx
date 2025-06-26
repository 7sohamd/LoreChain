"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Sparkles, User } from "lucide-react"
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
    const addonsFetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), upvotes: doc.data().upvotes || [] }))

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
    if (!addonContent) return alert("Please write something to continue the story.")
    setAddonSubmitting(true)
    try {
      await addDoc(collection(db, "stories"), {
        title: "",
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

  // Helper to parse story content into segments and contributors
  function parseStorySegments(content: string) {
    // Each segment is separated by --- and ends with *Contributed by ...*
    const parts = content.split(/---/g).map(part => part.trim()).filter(Boolean)
    return parts.map(part => {
      // Try to extract contributor
      const match = part.match(/\*Contributed by ([^*]+)\*$/)
      const contributor = match ? match[1].trim() : story.authorName
      // Remove the contributor line from the content
      const text = match ? part.replace(/\*Contributed by ([^*]+)\*$/, '').trim() : part
      return { text, contributor }
    })
  }

  if (loading) return <div className="text-center py-12 text-slate-300">Loading story...</div>
  if (!story) return <div className="text-center py-12 text-slate-300">Story not found.</div>

  const segments = parseStorySegments(story.content)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Button asChild variant="ghost" className="mb-6 text-slate-600 hover:text-black">
          <Link href="/lore">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Lore Archive
          </Link>
        </Button>

        {/* Story Segments Chain */}
        <div className="space-y-8">
          {segments.map((seg, idx) => (
            <div key={idx} className="relative flex flex-col md:flex-row bg-white/90 rounded-xl shadow-lg border border-purple-200 p-6">
              <div className="flex-1 pr-0 md:pr-8">
                <div className="text-lg text-black whitespace-pre-wrap">{seg.text}</div>
              </div>
              <div className="flex flex-row md:flex-col items-center md:items-end md:justify-between min-w-[140px] mt-4 md:mt-0 md:ml-4">
                <div className="flex items-center gap-2 text-black font-semibold">
                  <User className="w-5 h-5 text-purple-400" />
                  {seg.contributor}
                </div>
              </div>
              {idx < segments.length - 1 && (
                <div className="absolute left-1/2 -bottom-6 transform -translate-x-1/2">
                  <span className="bg-purple-100 text-purple-700 px-4 py-1 rounded-full shadow text-xs font-semibold border border-purple-200">Continuation of the story</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add-on form */}
        <div className="mt-12">
          <textarea className="w-full mb-2 p-2 rounded bg-slate-200 text-black border border-slate-300"
            placeholder="Write the next part of the story..." rows={4} value={addonContent}
            onChange={e => setAddonContent(e.target.value)}
          />
          <Button onClick={handleAddonSubmit} disabled={addonSubmitting} className="bg-purple-600 text-white hover:bg-purple-700">
            {addonSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>

        {/* Add-ons list */}
        {addons.length > 0 && (
          <div className="mt-10">
            <h3 className="text-black text-lg font-semibold mb-2">Story Add-ons</h3>
            <div className="space-y-4">
              {addons.map(a => (
                <Card key={a.id} className="bg-slate-100 border-slate-300">
                  <CardHeader>
                    <CardTitle className="text-black text-base">{a.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-black mb-2">{a.content}</p>
                    <div className="flex gap-2 items-center mt-2">
                      <Button size="sm" onClick={() => handleAddonVote(a.id)} className="bg-purple-200 text-black hover:bg-purple-300">Upvote ({a.upvotes?.length || 0})</Button>
                      <span className="text-xs text-black ml-2">by {a.authorName}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <Separator className="bg-slate-300 my-10" />

        <div className="text-sm text-black space-y-1 text-right">
          <p>Created by <span className="text-purple-700 font-mono">{story.authorName}</span></p>
          <p>Submitted on {story.createdAt?.toDate ? new Date(story.createdAt.toDate()).toLocaleDateString() : ""}</p>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Send, Lightbulb } from "lucide-react"
import { AIResponseBox } from "@/components/ai-response-box"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth"
import { collection, addDoc, Timestamp } from "firebase/firestore"
import { cn } from "@/lib/utils"
const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

export default function WritePage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAISuggestions, setShowAISuggestions] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiSuggestions, setAISuggestions] = useState<string[]>([])
  const [imageUrl, setImageUrl] = useState("")
  const [imageUploading, setImageUploading] = useState(false)
  const [imageError, setImageError] = useState("")

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleGetAISuggestions = async () => {
    setIsGenerating(true)
    setShowAISuggestions(true)
    try {
      const res = await fetch("/api/openrouter-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, category }),
      })
      const data = await res.json()
      setAISuggestions(data.suggestions || ["No suggestions found."])
    } catch (err) {
      setAISuggestions(["Failed to get AI suggestions."])
    }
    setIsGenerating(false)
  }

  const handleSubmit = async () => {
    if (!user) {
      alert("Please sign in to submit lore.")
      return
    }
    setIsSubmitting(true)
    try {
      await addDoc(collection(db, "stories"), {
        title,
        content,
        category,
        authorId: user.uid,
        authorName: user.displayName || user.email,
        createdAt: Timestamp.now(),
        upvotes: [],
        downvotes: [],
        isMain: false,
        parentMainId: null,
        imageUrl: imageUrl || null,
      })
      alert("Story submitted successfully!")
      // Clear the form
      setTitle("")
      setContent("")
      setCategory("")
      setImageUrl("")
    } catch (err) {
      console.error(err)
      alert("Failed to submit story.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    setImageError("");
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setImageUrl(data.data.url);
      } else {
        setImageError("Failed to upload image.");
      }
    } catch (err) {
      setImageError("Failed to upload image.");
    }
    setImageUploading(false);
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-300">Loading...</div>
  }

  if (!user) {
    return <div className="text-center py-12 text-slate-300">Please sign in to write your story.</div>
  }

  return (
    <div className="relative min-h-screen py-8 pt-24" style={{ background: '#fff9de' }}>
      {/* Dot Background */}
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:12px_12px]",
          "[background-image:radial-gradient(#3d2c00_1px,transparent_1px)]"
        )} />
      {/* Radial gradient for the container to give a faded look */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"
        style={{ background: '#fff9de' }}></div>
      
      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#3d2c00] mb-4">
            Write New Lore
          </h1>
          <p className="text-[#5c4a1a] text-lg font-mono">
            Contribute to the ever-expanding universe. Use AI assistance to enhance your creativity.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-white border border-[#f5e6b2]">
              <CardHeader>
                <CardTitle className="text-[#3d2c00] flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-[#ffb300]" />
                  Lore Entry
                </CardTitle>
                <CardDescription className="text-[#5c4a1a] font-mono">
                  Create compelling lore that expands the universe
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-[#3d2c00]">
                    Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter a compelling title for your lore..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-[#fff9de] border-[#f5e6b2] text-[#3d2c00] placeholder:text-[#a3a380]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-[#3d2c00]">
                    Category
                  </Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-[#fff9de] border-[#f5e6b2] text-[#3d2c00]">
                      <SelectValue placeholder="Select a category" className="text-[#3d2c00]" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#f5e6b2] text-[#3d2c00]">
                      <SelectItem value="mystery/crime" className="text-[#3d2c00] hover:bg-[#fff9de]">Mystery/Crime</SelectItem>
                      <SelectItem value="fantasy" className="text-[#3d2c00] hover:bg-[#fff9de]">Fantasy</SelectItem>
                      <SelectItem value="science fiction" className="text-[#3d2c00] hover:bg-[#fff9de]">Science Fiction</SelectItem>
                      <SelectItem value="romance" className="text-[#3d2c00] hover:bg-[#fff9de]">Romance</SelectItem>
                      <SelectItem value="thriller/suspense" className="text-[#3d2c00] hover:bg-[#fff9de]">Thriller/Suspense</SelectItem>
                      <SelectItem value="event" className="text-[#3d2c00] hover:bg-[#fff9de]">Event</SelectItem>
                      <SelectItem value="horror" className="text-[#3d2c00] hover:bg-[#fff9de]">Horror</SelectItem>
                      <SelectItem value="comedy" className="text-[#3d2c00] hover:bg-[#fff9de]">Comedy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content" className="text-[#3d2c00]">
                    Lore Content
                  </Label>
                  <Textarea
                    id="content"
                    placeholder="Write your lore here... Describe the characters, places, events, or objects that will become part of the canon universe."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="bg-[#fff9de] border-[#f5e6b2] text-[#3d2c00] placeholder:text-[#a3a380] min-h-[300px] resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#3d2c00]">Attach Image (optional)</Label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-[#3d2c00] bg-[#fff9de] border border-[#f5e6b2] rounded px-3 py-2"
                    disabled={imageUploading}
                  />
                  {imageUploading && <div className="text-[#a3a380] text-sm">Uploading...</div>}
                  {imageError && <div className="text-red-500 text-sm">{imageError}</div>}
                  {imageUrl && (
                    <div className="mt-2">
                      <img src={imageUrl} alt="Preview" className="max-h-48 rounded border border-[#f5e6b2] mx-auto" />
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleGetAISuggestions}
                    variant="outline"
                    className="border-[#ffb300] text-[#a3a380] hover:bg-[#fff9de]"
                    disabled={isGenerating}
                  >
                    <Sparkles className="mr-2 h-4 w-4 text-[#ffb300]" />
                    {isGenerating ? "Generating..." : "Get AI Suggestions"}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="bg-[#ffb300] text-[#3d2c00] hover:bg-[#ffd54f] font-bold shadow border border-[#f5e6b2]"
                    disabled={!title || !content || !category || isSubmitting}
                  >
                    <Send className="mr-2 h-4 w-4 text-[#3d2c00]" />
                    {isSubmitting ? "Submitting..." : "Submit for Voting"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Writing Tips */}
            <Card className="bg-white border border-[#f5e6b2]">
              <CardHeader>
                <CardTitle className="text-[#3d2c00] text-lg">Writing Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-[#5c4a1a] font-mono">
                <p>• Be specific and detailed in your descriptions</p>
                <p>• Consider how your lore connects to existing canon</p>
                <p>• Leave room for other creators to expand upon</p>
                <p>• Use evocative language that sparks imagination</p>
                <p>• AI suggestions can help overcome writer's block</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Suggestions */}
        {showAISuggestions && (
          <div className="mt-8">
            <AIResponseBox
              suggestions={aiSuggestions}
              isLoading={isGenerating}
              onSelectSuggestion={(suggestion) => {
                setContent(content + (content ? "\n\n" : "") + suggestion)
                setShowAISuggestions(false)
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

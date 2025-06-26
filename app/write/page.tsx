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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Write New Lore
          </h1>
          <p className="text-slate-300 text-lg">
            Contribute to the ever-expanding universe. Use AI assistance to enhance your creativity.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-400" />
                  Lore Entry
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Create compelling lore that expands the universe
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white">
                    Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter a compelling title for your lore..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-white">
                    Category
                  </Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="mystery/crime">Mystery/Crime</SelectItem>
                      <SelectItem value="fantasy">Fantasy</SelectItem>
                      <SelectItem value="science fiction">Science Fiction</SelectItem>
                      <SelectItem value="romance">Romance</SelectItem>
                      <SelectItem value="thriller/suspense">Thriller/Suspense</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="horror">Horror</SelectItem>
                      <SelectItem value="comedy">Comedy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content" className="text-white">
                    Lore Content
                  </Label>
                  <Textarea
                    id="content"
                    placeholder="Write your lore here... Describe the characters, places, events, or objects that will become part of the canon universe."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 min-h-[300px] resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Attach Image (optional)</Label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-white bg-slate-700 border border-slate-600 rounded px-3 py-2"
                    disabled={imageUploading}
                  />
                  {imageUploading && <div className="text-slate-400 text-sm">Uploading...</div>}
                  {imageError && <div className="text-red-500 text-sm">{imageError}</div>}
                  {imageUrl && (
                    <div className="mt-2">
                      <img src={imageUrl} alt="Preview" className="max-h-48 rounded border border-slate-600 mx-auto" />
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleGetAISuggestions}
                    variant="outline"
                    className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
                    disabled={isGenerating}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {isGenerating ? "Generating..." : "Get AI Suggestions"}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                    disabled={!title || !content || !category || isSubmitting}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Submitting..." : "Submit for Voting"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Writing Tips */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Writing Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
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

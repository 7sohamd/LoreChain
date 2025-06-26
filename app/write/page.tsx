"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Send, Lightbulb, Wallet } from "lucide-react"
import { ConnectWalletModal } from "@/components/connect-wallet-modal"
import { AIResponseBox } from "@/components/ai-response-box"

export default function WritePage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [showAISuggestions, setShowAISuggestions] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiSuggestions, setAISuggestions] = useState<string[]>([])

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

  const handleSubmit = () => {
    if (!isConnected) {
      setShowWalletModal(true)
      return
    }
    // Handle submission logic
    console.log("Submitting lore:", { title, content, category })
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
                      <SelectItem value="character">Character</SelectItem>
                      <SelectItem value="place">Place</SelectItem>
                      <SelectItem value="faction">Faction</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="object">Object</SelectItem>
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
                    disabled={!title || !content || !category}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Submit for Voting
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Wallet Status */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Wallet Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isConnected ? (
                  <div className="space-y-2">
                    <Badge className="bg-green-600/20 text-green-400 border-green-500/50">✅ Connected</Badge>
                    <p className="text-sm text-slate-300">0x742d...35Bc</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
                      ⚠️ Not Connected
                    </Badge>
                    <p className="text-sm text-slate-300">Connect your wallet to submit lore</p>
                    <Button
                      onClick={() => setShowWalletModal(true)}
                      size="sm"
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      Connect Wallet
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

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

        <ConnectWalletModal
          isOpen={showWalletModal}
          onClose={() => setShowWalletModal(false)}
        />
      </div>
    </div>
  )
}

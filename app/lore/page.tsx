"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter } from "lucide-react"
import { LoreCard } from "@/components/lore-card"

const mockLoreEntries = [
  {
    id: "1",
    title: "The Nexus Convergence",
    excerpt:
      "A mysterious event where multiple realities began to bleed into one another, creating pockets of impossible physics and merged timelines. Scholars debate whether this was a natural phenomenon or the result of ancient technology awakening.",
    author: "0x742d...35Bc",
    type: "Event",
    isCanon: true,
    votes: 127,
    aiGenerated: false,
  },
  {
    id: "2",
    title: "House Voidwhisper",
    excerpt:
      "An ancient faction that claims to hear the voices of the void between stars, using this knowledge to manipulate quantum probabilities. Their members are recognizable by the way shadows seem to bend around them.",
    author: "0x8f3a...91De",
    type: "Faction",
    isCanon: true,
    votes: 89,
    aiGenerated: true,
  },
  {
    id: "3",
    title: "The Ethereal Codex",
    excerpt:
      "A living document that rewrites itself based on the collective unconscious of nearby sentient beings, containing prophecies that change based on who reads them. Some say it's trying to prevent its own predictions.",
    author: "0x1c7b...44Af",
    type: "Object",
    isCanon: false,
    votes: 23,
    aiGenerated: false,
  },
  {
    id: "4",
    title: "Zara the Quantum Thief",
    excerpt:
      "A legendary figure who can steal not just objects, but concepts, memories, and even possibilities. She once stole the concept of 'defeat' from an entire army, making them literally incapable of losing.",
    author: "0x9d2e...77Cc",
    type: "Character",
    isCanon: false,
    votes: 45,
    aiGenerated: true,
  },
  {
    id: "5",
    title: "The Singing Nebula",
    excerpt:
      "A cosmic phenomenon where stellar gases vibrate at frequencies that create hauntingly beautiful melodies. Pilots report that the songs change based on their emotional state, sometimes driving them to madness or enlightenment.",
    author: "0x3f8a...12Bd",
    type: "Place",
    isCanon: true,
    votes: 156,
    aiGenerated: false,
  },
  {
    id: "6",
    title: "The Memory Markets",
    excerpt:
      "Underground bazaars where experiences, skills, and memories are traded like commodities. The most valuable memories are those of love and loss, while nightmares are surprisingly cheap.",
    author: "0x6b4c...88Ee",
    type: "Place",
    isCanon: false,
    votes: 67,
    aiGenerated: true,
  },
]

export default function LorePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")

  const filteredEntries = mockLoreEntries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || entry.type.toLowerCase() === typeFilter
    const matchesTab =
      activeTab === "all" || (activeTab === "canon" && entry.isCanon) || (activeTab === "pending" && !entry.isCanon)

    return matchesSearch && matchesType && matchesTab
  })

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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
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

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-slate-800 border-slate-700">
              <TabsTrigger value="all" className="data-[state=active]:bg-purple-600">
                All ({mockLoreEntries.length})
              </TabsTrigger>
              <TabsTrigger value="canon" className="data-[state=active]:bg-green-600">
                Canon ({mockLoreEntries.filter((e) => e.isCanon).length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="data-[state=active]:bg-yellow-600">
                Pending ({mockLoreEntries.filter((e) => !e.isCanon).length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Lore Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEntries.map((entry) => (
            <LoreCard key={entry.id} entry={entry} />
          ))}
        </div>

        {filteredEntries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">No lore entries match your search criteria.</p>
            <Button asChild className="mt-4 bg-purple-600 hover:bg-purple-700">
              <a href="/write">Create New Lore</a>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

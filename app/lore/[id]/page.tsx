import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Share2, ExternalLink, ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"
import { VoteButton } from "@/components/vote-button"
import { CanonStatusBadge } from "@/components/canon-status-badge"

// Mock data - in real app this would come from props/API
const mockEntry = {
  id: "1",
  title: "The Nexus Convergence",
  content: `The Nexus Convergence began as a whisper in the quantum foam, a subtle disturbance that most dismissed as background radiation. But Dr. Elena Vasquez, working late in her laboratory on Kepler Station, noticed the pattern first—a rhythmic pulse that seemed to echo across multiple dimensional frequencies simultaneously.

What started as scientific curiosity quickly became existential terror as reality itself began to fracture. The first signs were small: shadows that fell upward, water that flowed in impossible directions, gravity that seemed to forget its own rules in localized pockets throughout the station.

Within hours, the phenomenon had spread beyond the station. Reports flooded in from across the galaxy—entire star systems where the laws of physics had become... negotiable. On Proxima VII, colonists watched in awe as their dead loved ones walked among them, not as ghosts, but as living beings from parallel timelines where they had never died.

The Convergence, as it came to be known, wasn't destroying reality—it was merging it. Every possible timeline, every quantum possibility that had ever existed, was bleeding through into a single, impossibly complex present. The universe was becoming a palimpsest, with layers of reality written over one another in an endless, beautiful, terrifying manuscript.

Some say the Convergence was triggered by humanity's first successful experiment with quantum consciousness transfer. Others believe it was the natural result of the universe reaching a critical mass of sentient observation. The truth, like everything else touched by the Convergence, exists in multiple states simultaneously.

What we know for certain is that the old universe—the one with fixed rules and predictable outcomes—is gone forever. In its place is something far more wondrous and dangerous: a reality where anything that can be imagined has already happened, somewhere, somewhen, in the infinite tapestry of the Nexus Convergence.`,
  author: "0x742d...35Bc",
  type: "Event",
  isCanon: true,
  votes: 127,
  aiGenerated: false,
  createdAt: "2024-01-15T10:30:00Z",
  canonizedAt: "2024-01-22T14:45:00Z",
}

export default function EntryPage({ params }: { params: { id: string } }) {
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
                <h1 className="text-3xl font-bold text-white leading-tight">{mockEntry.title}</h1>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                    {mockEntry.type}
                  </Badge>
                  <CanonStatusBadge isCanon={mockEntry.isCanon} />
                  {mockEntry.aiGenerated && (
                    <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                      <Sparkles className="mr-1 h-3 w-3" />
                      AI-Assisted
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                {mockEntry.isCanon && (
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
              <div className="text-slate-200 leading-relaxed whitespace-pre-wrap text-lg">{mockEntry.content}</div>
            </div>

            <Separator className="bg-slate-700" />

            {/* Author & Metadata */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-slate-400">
              <div className="space-y-1">
                <p>
                  Created by <span className="text-purple-400 font-mono">{mockEntry.author}</span>
                </p>
                <p>Submitted on {new Date(mockEntry.createdAt).toLocaleDateString()}</p>
                {mockEntry.isCanon && mockEntry.canonizedAt && (
                  <p className="text-green-400">Canonized on {new Date(mockEntry.canonizedAt).toLocaleDateString()}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-white">{mockEntry.votes} votes</p>
              </div>
            </div>

            {/* Voting Section */}
            {!mockEntry.isCanon && (
              <>
                <Separator className="bg-slate-700" />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Community Voting</h3>
                  <p className="text-slate-300 text-sm">
                    Help decide if this lore should become part of the official canon. Quality entries that enhance the
                    universe will be approved by community consensus.
                  </p>
                  <div className="flex gap-3">
                    <VoteButton type="up" count={89} />
                    <VoteButton type="down" count={12} />
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

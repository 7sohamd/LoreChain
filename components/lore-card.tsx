import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles } from "lucide-react"
import { CanonStatusBadge } from "./canon-status-badge"
import { VoteButton } from "./vote-button"

interface LoreEntry {
  id: string
  title: string
  excerpt: string
  author: string
  type: string
  isCanon: boolean
  votes: number
  aiGenerated?: boolean
}

interface LoreCardProps {
  entry: LoreEntry
}

export function LoreCard({ entry }: LoreCardProps) {
  return (
    <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors group h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-2 flex-1">
            <CardTitle className="text-white group-hover:text-purple-300 transition-colors leading-tight">
              {entry.title}
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                {entry.type}
              </Badge>
              <CanonStatusBadge isCanon={entry.isCanon} />
              {entry.aiGenerated && (
                <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                  <Sparkles className="mr-1 h-3 w-3" />
                  AI
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <CardDescription className="text-slate-300 mb-4 line-clamp-3 flex-1">{entry.excerpt}</CardDescription>

        <div className="space-y-3 mt-auto">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">by {entry.author}</span>
            <span className="text-slate-400">{entry.votes} votes</span>
          </div>

          <div className="flex items-center justify-between">
            {!entry.isCanon && (
              <div className="flex gap-1">
                <VoteButton type="up" count={Math.floor(entry.votes * 0.7)} compact />
                <VoteButton type="down" count={Math.floor(entry.votes * 0.3)} compact />
              </div>
            )}
            <Button asChild variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300 ml-auto">
              <Link href={`/lore/${entry.id}`}>
                View {entry.isCanon ? "Canon" : "Entry"} <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles } from "lucide-react"
import { CanonStatusBadge } from "./canon-status-badge"
import { VoteButton } from "./vote-button"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useState } from "react"

interface LoreEntry {
  id: string
  title: string
  excerpt: string
  author: string
  type: string
  isCanon: boolean
  votes: number
  aiGenerated?: boolean
  authorWallet?: string | null
  imageUrl?: string
  upvotes?: any[]
  downvotes?: any[]
}

interface LoreCardProps {
  entry: LoreEntry
  onVote?: (type: "up" | "down") => void
  hasUpvoted?: boolean
  hasDownvoted?: boolean
}

export function LoreCard({ entry, onVote, hasUpvoted, hasDownvoted }: LoreCardProps) {
  const [tipAmount, setTipAmount] = useState(1)
  const [tipLoading, setTipLoading] = useState(false)
  const [tipSuccess, setTipSuccess] = useState(false)
  const [tipError, setTipError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const canTip = !!entry.authorWallet

  const handleTip = async () => {
    setTipLoading(true)
    setTipError(null)
    setTipSuccess(false)
    try {
      const res = await fetch("/api/tip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientWallet: entry.authorWallet, amount: tipAmount })
      })
      if (res.status === 200) {
        setTipSuccess(true)
        setTimeout(() => {
          setModalOpen(false)
          setTipSuccess(false)
        }, 1500)
      } else if (res.status === 402) {
        setTipError("Payment required. Please complete payment.")
      } else {
        setTipError("Failed to send tip.")
      }
    } catch (err) {
      setTipError("Error sending tip.")
    }
    setTipLoading(false)
  }

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
        {entry.imageUrl && entry.imageUrl.trim() !== "" && (
          <div className="mb-3">
            <img
              src={entry.imageUrl}
              alt={entry.title}
              className="w-full max-h-48 object-cover rounded border border-[#f5e6b2] mx-auto"
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        )}
        <CardDescription className="text-slate-300 mb-4 line-clamp-3 flex-1">{entry.excerpt}</CardDescription>

        <div className="space-y-3 mt-auto">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">by {entry.author}</span>
            <span className="text-slate-400">{entry.votes} votes</span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-1">
              <VoteButton
                type="up"
                count={entry.upvotes?.length || 0}
                compact
                onVote={() => onVote && onVote("up")}
                disabled={!!hasUpvoted || !!hasDownvoted}
                selected={!!hasUpvoted}
              />
              <VoteButton
                type="down"
                count={entry.downvotes?.length || 0}
                compact
                onVote={() => onVote && onVote("down")}
                disabled={!!hasUpvoted || !!hasDownvoted}
                selected={!!hasDownvoted}
              />
            </div>
            <Button asChild variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300 ml-auto">
              <Link href={`/lore/${entry.id}`}>
                View {entry.isCanon ? "Canon" : "Entry"} <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="ml-2 text-green-500 border-green-500 hover:bg-green-500/10" disabled={!canTip}>
                  Tip the Writer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tip the Writer</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                  <label className="text-sm">Enter tip amount (USDC):</label>
                  <input
                    type="number"
                    min={0.01}
                    step={0.01}
                    value={tipAmount}
                    onChange={e => setTipAmount(Number(e.target.value))}
                    className="border rounded px-2 py-1 bg-slate-900 text-white"
                    disabled={tipLoading}
                  />
                  <div className="text-xs text-slate-400">
                    Recipient Wallet: {entry.authorWallet ? (
                      <span className="text-green-400 font-mono">{entry.authorWallet.slice(0, 6)}...{entry.authorWallet.slice(-4)}</span>
                    ) : (
                      <span className="text-red-400">Not linked</span>
                    )}
                  </div>
                  {tipError && <div className="text-red-500 text-xs">{tipError}</div>}
                  {tipSuccess && <div className="text-green-500 text-xs">Tip sent successfully!</div>}
                </div>
                <DialogFooter>
                  <Button variant="default" className="w-full mt-2" disabled={!canTip || tipLoading} onClick={handleTip}>
                    {tipLoading ? "Sending..." : "Confirm Tip"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles } from "lucide-react"
import { VoteButton } from "./vote-button"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useState } from "react"
import { ethers } from "ethers"

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
  trendingId?: string
}

const USDC_ADDRESS = "0x5425890298aed601595a70AB815c96711a31Bc65"
const USDC_ABI = [
  "function transfer(address to, uint amount) public returns (bool)"
]

export function LoreCard({ entry, onVote, hasUpvoted, hasDownvoted, trendingId }: LoreCardProps) {
  const [tipAmount, setTipAmount] = useState(1)
  const [tipLoading, setTipLoading] = useState(false)
  const [tipSuccess, setTipSuccess] = useState(false)
  const [tipError, setTipError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [token, setToken] = useState("USDC")
  const [txHash, setTxHash] = useState("")
  const canTip = !!entry.authorWallet

  const handleTip = async () => {
    setTipLoading(true)
    setTipError(null)
    setTipSuccess(false)
    setTxHash("")
    try {
      if (!window.ethereum) throw new Error("Please install MetaMask!")
      await window.ethereum.request({ method: "eth_requestAccounts" })
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      let tx
      if (token === "USDC") {
        const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer)
        const amountInWei = ethers.parseUnits(tipAmount.toString(), 6)
        tx = await usdc.transfer(entry.authorWallet, amountInWei)
      } else if (token === "AVAX") {
        const amountInWei = ethers.parseEther(tipAmount.toString())
        tx = await signer.sendTransaction({
          to: entry.authorWallet,
          value: amountInWei
        })
      }
      setTipSuccess(true)
      setTxHash(tx.hash)
      setTimeout(() => {
        setModalOpen(false)
        setTipSuccess(false)
        setTxHash("")
      }, 5000)
    } catch (err: any) {
      setTipError("Payment failed: " + (err.message || err))
    }
    setTipLoading(false)
  }

  return (
    <Card className="relative z-0 bg-[#fff9de] border border-[#f5e6b2] hover:border-[#ffb300] transition-colors group h-full flex flex-col">
      {entry.id === trendingId && (
        <div className="px-3 pt-3">
          <span className="inline-block px-3 py-1 rounded-full border border-[#ffb300] text-[#ffb300] font-bold text-xs bg-[#fff9de] mb-2">TRENDING</span>
        </div>
      )}
      <CardHeader className="flex-shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-2 flex-1">
            <CardTitle className="text-[#3d2c00] group-hover:text-[#ffb300] transition-colors leading-tight text-justify">
              {entry.title}
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="bg-[#fff9de] text-[#a3a380] border-[#f5e6b2]">
                {entry.type}
              </Badge>
              {entry.aiGenerated && (
                <Badge variant="outline" className="border-[#ffb300] text-[#ffb300]">
                  <Sparkles className="mr-1 h-3 w-3 text-[#ffb300]" />
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
        <CardDescription className="text-[#5c4a1a] mb-4 line-clamp-3 flex-1 font-mono text-justify">{entry.excerpt}</CardDescription>

        <div className="space-y-3 mt-auto">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#5c4a1a] font-mono">by {entry.author}</span>
            <span className="text-[#5c4a1a] font-mono">{entry.votes} votes</span>
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
            <div className="flex gap-2 ml-auto z-10">
              <Button asChild variant="outline" size="sm" className="border-[#ffb300] text-[#3d2c00] bg-transparent hover:bg-[#ffb300] hover:text-[#3d2c00] font-bold rounded-lg shadow-sm transition-colors">
                <Link href={`/lore/${entry.id}`}>
                  View {entry.isCanon ? "Canon" : "Entry"} <ArrowRight className="ml-1 h-3 w-3 text-[#3d2c00]" />
                </Link>
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="border-[#ffb300] text-[#3d2c00] bg-transparent hover:bg-[#ffb300] hover:text-[#3d2c00] font-bold rounded-lg shadow-sm transition-colors" disabled={!canTip}>
                    Tip the Writer
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tip the Writer</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col gap-4">
                    <label className="text-sm">Enter tip amount:</label>
                    <input
                      type="number"
                      min={0.01}
                      step={0.01}
                      value={tipAmount}
                      onChange={e => setTipAmount(Number(e.target.value))}
                      className="border rounded px-2 py-1 bg-slate-900 text-white"
                      disabled={tipLoading}
                    />
                    <label className="text-sm">Token:</label>
                    <select value={token} onChange={e => setToken(e.target.value)} disabled={tipLoading} className="border rounded px-2 py-1 bg-slate-900 text-white">
                      <option value="USDC">USDC</option>
                      <option value="AVAX">AVAX</option>
                    </select>
                    <div className="text-xs text-slate-400">
                      Recipient Wallet: {entry.authorWallet ? (
                        <span className="text-green-400 font-mono">{entry.authorWallet.slice(0, 6)}...{entry.authorWallet.slice(-4)}</span>
                      ) : (
                        <span className="text-red-400">Not linked</span>
                      )}
                    </div>
                    {tipError && <div className="text-red-500 text-xs">{tipError}</div>}
                    {tipSuccess && <div className="text-green-500 text-xs">Tip sent successfully!</div>}
                    {txHash && (
                      <div className="text-xs text-blue-400">
                        Transaction: <a href={`https://testnet.snowtrace.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="underline">{txHash.slice(0, 10)}...{txHash.slice(-6)}</a>
                      </div>
                    )}
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
        </div>
      </CardContent>
    </Card>
  )
}

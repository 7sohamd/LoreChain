"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface VoteButtonProps {
  type: "up" | "down"
  count: number
  compact?: boolean
  onVote?: (type: "up" | "down") => void
}

export function VoteButton({ type, count, compact = false, onVote }: VoteButtonProps) {
  const [hasVoted, setHasVoted] = useState(false)
  const [currentCount, setCurrentCount] = useState(count)

  const handleVote = () => {
    if (hasVoted) return

    setHasVoted(true)
    setCurrentCount((prev) => prev + 1)
    onVote?.(type)
  }

  const Icon = type === "up" ? ThumbsUp : ThumbsDown
  const colorClass =
    type === "up"
      ? "text-green-400 hover:text-green-300 border-green-500/50 hover:bg-green-500/10"
      : "text-red-400 hover:text-red-300 border-red-500/50 hover:bg-red-500/10"

  return (
    <Button
      variant="outline"
      size={compact ? "sm" : "default"}
      onClick={handleVote}
      disabled={hasVoted}
      className={cn(
        "bg-transparent",
        colorClass,
        hasVoted && "opacity-50 cursor-not-allowed",
        compact && "px-2 py-1 h-auto text-xs",
      )}
    >
      <Icon className={cn("h-4 w-4", !compact && "mr-2")} />
      {!compact && (type === "up" ? "Upvote" : "Downvote")}
      <span className={cn(compact ? "ml-1" : "ml-2", "font-semibold")}>{currentCount}</span>
    </Button>
  )
}

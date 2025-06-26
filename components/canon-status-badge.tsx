import { Badge } from "@/components/ui/badge"

interface CanonStatusBadgeProps {
  isCanon: boolean
}

export function CanonStatusBadge({ isCanon }: CanonStatusBadgeProps) {
  if (isCanon) {
    return <Badge className="bg-green-600/20 text-green-400 border-green-500/50">✅ Canon</Badge>
  }

  return (
    <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
      ⏳ Pending
    </Badge>
  )
}

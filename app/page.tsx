import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pen, Globe, ArrowRight, Sparkles, Vote, CircleIcon as Chain } from "lucide-react"
import Link from "next/link"

const featuredEntries = [
  {
    id: "1",
    title: "The Nexus Convergence",
    excerpt:
      "A mysterious event where multiple realities began to bleed into one another, creating pockets of impossible physics and merged timelines...",
    author: "0x742d...35Bc",
    type: "Event",
    isCanon: true,
  },
  {
    id: "2",
    title: "House Voidwhisper",
    excerpt:
      "An ancient faction that claims to hear the voices of the void between stars, using this knowledge to manipulate quantum probabilities...",
    author: "0x8f3a...91De",
    type: "Faction",
    isCanon: true,
  },
  {
    id: "3",
    title: "The Ethereal Codex",
    excerpt:
      "A living document that rewrites itself based on the collective unconscious of nearby sentient beings, containing prophecies that change...",
    author: "0x1c7b...44Af",
    type: "Object",
    isCanon: false,
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 blur-3xl" />
        <div className="relative container mx-auto px-4 py-24 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-6">
              Write the Next Universe. Together.
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-12 leading-relaxed">
              AI-assisted, community-voted, immutable lore on-chain.
              <br />
              <span className="text-purple-400">Collaborative worldbuilding for the decentralized age.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 text-lg"
              >
                <Link href="/write">
                  <Pen className="mr-2 h-5 w-5" />
                  Start Writing
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 px-8 py-6 text-lg"
              >
                <Link href="/lore">
                  <Globe className="mr-2 h-5 w-5" />
                  Explore Canon
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-white">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Pen className="h-10 w-10 text-purple-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">✍️ Write or Expand</h3>
              <p className="text-slate-300 leading-relaxed">
                Create new lore or expand existing entries with AI assistance. Tag your content as characters, places,
                factions, events, or objects.
              </p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Vote className="h-10 w-10 text-green-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">✅ Community Vote</h3>
              <p className="text-slate-300 leading-relaxed">
                Submit your lore to the community for voting. Quality entries that enhance the universe get approved by
                consensus.
              </p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Chain className="h-10 w-10 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">🪐 Canonized On-Chain</h3>
              <p className="text-slate-300 leading-relaxed">
                Approved lore becomes permanent canon, stored immutably on-chain via IPFS. Your contributions become
                part of the eternal universe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Canon Entries */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold text-white">Featured Canon</h2>
            <Button asChild variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10">
              <Link href="/lore">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEntries.map((entry) => (
              <Card
                key={entry.id}
                className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors group"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white group-hover:text-purple-300 transition-colors">
                        {entry.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                          {entry.type}
                        </Badge>
                        {entry.isCanon ? (
                          <Badge className="bg-green-600/20 text-green-400 border-green-500/50">✅ Canon</Badge>
                        ) : (
                          <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
                            ⏳ Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-300 mb-4 line-clamp-3">{entry.excerpt}</CardDescription>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">by {entry.author}</span>
                    <Button asChild variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
                      <Link href={`/lore/${entry.id}`}>
                        View {entry.isCanon ? "Canon" : "Entry"} <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6 text-white">Ready to Shape Reality?</h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands of creators building the most ambitious collaborative universe ever conceived.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 text-lg"
          >
            <Link href="/write">
              <Sparkles className="mr-2 h-5 w-5" />
              Begin Your Legend
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

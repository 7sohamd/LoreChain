import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pen, Globe, ArrowRight, Sparkles, Vote, CircleIcon as Chain } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

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
    <div className="min-h-screen bg-gradient-to-br from-[#fff9de] via-[#fff] to-[#fff9de] relative overflow-hidden">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center bg-[#fff9de] relative overflow-hidden">
        {/* Grid background for hero section */}
        <div className={
          cn(
            "absolute inset-0 z-0",
            "[background-size:40px_40px]",
            "[background-image:linear-gradient(to_right,#FBE19D_1px,transparent_1px),linear-gradient(to_bottom,#FBE19D_1px,transparent_1px)]"
          )
        } />
        {/* Radial gradient mask for faded look */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#fff9de] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        <div className="text-center w-full relative z-10">
          <h1 className="text-6xl md:text-7xl font-bold text-[#3d2c00] mb-6">
            Write the <span className="bg-gradient-to-r from-blue-400 via-pink-400 to-yellow-300 bg-clip-text text-transparent inline-block">Next Universe</span>. Together.
          </h1>
          <p className="text-xl md:text-2xl text-[#5c4a1a] mb-8 font-mono typewriter">
            AI-assisted, community-voted, immutable lore on-chain.<br/>
            Collaborative worldbuilding for the decentralized age.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/write" passHref legacyBehavior>
              <Button className="bg-[#ffb300] text-[#3d2c00] px-8 py-6 text-lg font-semibold rounded-lg shadow hover:bg-[#ffd54f]">
                Start Writing
              </Button>
            </Link>
            <Button className="bg-white border border-[#ffb300] text-[#a3a380] px-8 py-6 text-lg font-semibold rounded-lg shadow hover:bg-[#fff9de]">
              Explore Canon
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-[#fff]">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-slate-800">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-blue-200/40 to-blue-100/40 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Pen className="h-10 w-10 text-blue-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-slate-800">✍️ Write or Expand</h3>
              <p className="text-slate-600 leading-relaxed font-mono">
                Create new lore or expand existing entries with AI assistance. Tag your content as characters, places,
                factions, events, or objects.
              </p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Vote className="h-10 w-10 text-green-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-slate-800">✅ Community Vote</h3>
              <p className="text-slate-600 leading-relaxed font-mono">
                Submit your lore to the community for voting. Quality entries that enhance the universe get approved by
                consensus.
              </p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Chain className="h-10 w-10 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-slate-800">🪐 Canonized On-Chain</h3>
              <p className="text-slate-600 leading-relaxed font-mono">
                Approved lore becomes permanent canon, stored immutably on-chain via IPFS. Your contributions become
                part of the eternal universe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Canon Entries */}
      <section className="py-24 bg-[#fff9de]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold text-slate-900">Featured Canon</h2>
            <Button asChild className="bg-[#ffb300] text-[#3d2c00] border-none shadow hover:bg-[#ffd54f]">
              <Link href="/lore">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEntries.map((entry) => (
              <Card
                key={entry.id}
                className="bg-white border border-[#f5e6b2] hover:border-[#ffb300] transition-colors group"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-[#3d2c00] group-hover:text-[#ffb300] transition-colors">
                        {entry.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="bg-[#fff9de] text-[#a3a380] border-[#f5e6b2]">
                          {entry.type}
                        </Badge>
                        {entry.isCanon ? (
                          <Badge className="bg-[#fffbe9] text-[#388e3c] border-[#c8e6c9]">✅ Canon</Badge>
                        ) : (
                          <Badge variant="outline" className="border-[#ffe082] text-[#ffb300]">
                            ⏳ Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-[#5c4a1a] mb-4 line-clamp-3">{entry.excerpt}</CardDescription>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#a3a380]">by {entry.author}</span>
                    <Button asChild variant="ghost" size="sm" className="text-[#ffb300] hover:text-[#3d2c00]">
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
      <section className="py-24 bg-[#fff]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6 text-[#3d2c00]">Ready to Shape Reality?</h2>
          <p className="text-xl text-[#5c4a1a] mb-8 max-w-2xl mx-auto font-mono">
            Join thousands of creators building the most ambitious collaborative universe ever conceived.
          </p>
          <Button
            asChild
            className="bg-[#ffb300] text-[#3d2c00] px-8 py-6 text-lg font-semibold rounded-lg shadow hover:bg-[#ffd54f]"
          >
            <a href="/write">Start Writing</a>
          </Button>
        </div>
      </section>
    </div>
  )
}

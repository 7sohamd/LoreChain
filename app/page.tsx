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
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] via-[#b6baff] to-[#e3eaff] relative overflow-hidden">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f7fa] via-[#e3eaff] to-[#b6baff]">
        <div className="text-center w-full">
          <h1 className="text-6xl md:text-7xl font-bold text-slate-900 mb-6">
            Write the <span className="text-blue-600">Next Universe</span>. Together.
          </h1>
          <p className="text-xl md:text-2xl text-slate-700 mb-8">
            AI-assisted, community-voted, immutable lore on-chain.<br/>
            <span className="text-blue-500">Collaborative worldbuilding for the decentralized age.</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-blue-600 text-white px-8 py-6 text-lg font-semibold rounded-lg shadow hover:bg-blue-700">
              Start Writing
            </Button>
            <Button className="bg-white border border-blue-200 text-blue-700 px-8 py-6 text-lg font-semibold rounded-lg shadow hover:bg-blue-50">
              Explore Canon
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white/80">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-slate-800">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-blue-200/40 to-blue-100/40 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Pen className="h-10 w-10 text-blue-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-slate-800">✍️ Write or Expand</h3>
              <p className="text-slate-600 leading-relaxed">
                Create new lore or expand existing entries with AI assistance. Tag your content as characters, places,
                factions, events, or objects.
              </p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Vote className="h-10 w-10 text-green-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-slate-800">✅ Community Vote</h3>
              <p className="text-slate-600 leading-relaxed">
                Submit your lore to the community for voting. Quality entries that enhance the universe get approved by
                consensus.
              </p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Chain className="h-10 w-10 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-slate-800">🪐 Canonized On-Chain</h3>
              <p className="text-slate-600 leading-relaxed">
                Approved lore becomes permanent canon, stored immutably on-chain via IPFS. Your contributions become
                part of the eternal universe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Canon Entries */}
      <section className="py-24 bg-blue-50/60">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold text-slate-900">Featured Canon</h2>
            <Button asChild variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
              <Link href="/lore">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEntries.map((entry) => (
              <Card
                key={entry.id}
                className="bg-white border border-blue-100 hover:border-blue-300 transition-colors group"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-slate-900 group-hover:text-blue-700 transition-colors">
                        {entry.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          {entry.type}
                        </Badge>
                        {entry.isCanon ? (
                          <Badge className="bg-green-100 text-green-700 border-green-300">✅ Canon</Badge>
                        ) : (
                          <Badge variant="outline" className="border-yellow-300 text-yellow-700">
                            ⏳ Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-700 mb-4 line-clamp-3">{entry.excerpt}</CardDescription>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">by {entry.author}</span>
                    <Button asChild variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
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
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6 text-slate-900">Ready to Shape Reality?</h2>
          <p className="text-xl text-slate-700 mb-8 max-w-2xl mx-auto">
            Join thousands of creators building the most ambitious collaborative universe ever conceived.
          </p>
          <Button
            asChild
            className="bg-blue-600 text-white px-8 py-6 text-lg font-semibold rounded-lg shadow hover:bg-blue-700"
          >
            <a href="/write">Start Writing</a>
          </Button>
        </div>
      </section>
    </div>
  )
}

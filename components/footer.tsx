import Link from "next/link"
import { Github, Twitter, DiscIcon as Discord } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">LC</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                LoreChain
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Collaborative worldbuilding for the decentralized age. Write the next universe together.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Platform</h3>
            <div className="space-y-2">
              <Link href="/write" className="block text-slate-400 hover:text-white transition-colors text-sm">
                Write Lore
              </Link>
              <Link href="/lore" className="block text-slate-400 hover:text-white transition-colors text-sm">
                Browse Canon
              </Link>
              <Link href="/me" className="block text-slate-400 hover:text-white transition-colors text-sm">
                My Submissions
              </Link>
            </div>
          </div>

          {/* Community */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Community</h3>
            <div className="space-y-2">
              <a href="#" className="block text-slate-400 hover:text-white transition-colors text-sm">
                Discord
              </a>
              <a href="#" className="block text-slate-400 hover:text-white transition-colors text-sm">
                Twitter
              </a>
              <a href="#" className="block text-slate-400 hover:text-white transition-colors text-sm">
                GitHub
              </a>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Resources</h3>
            <div className="space-y-2">
              <a href="#" className="block text-slate-400 hover:text-white transition-colors text-sm">
                Documentation
              </a>
              <a href="#" className="block text-slate-400 hover:text-white transition-colors text-sm">
                API
              </a>
              <a href="#" className="block text-slate-400 hover:text-white transition-colors text-sm">
                Whitepaper
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm">© 2024 LoreChain. Building the future of collaborative storytelling.</p>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <a href="#" className="text-slate-400 hover:text-white transition-colors">
              <Github className="h-5 w-5" />
            </a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">
              <Discord className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

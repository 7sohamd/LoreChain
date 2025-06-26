import Link from "next/link"
import { Github, Twitter, DiscIcon as Discord } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#fff9de] border-t border-[#f5e6b2] pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-8 w-8 bg-gradient-to-br from-[#ffb300] to-[#fffbe9] rounded-lg flex items-center justify-center">
                <span className="text-[#3d2c00] font-bold text-sm">LC</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#ffb300] to-[#a3a380] bg-clip-text text-transparent">
                LoreChain
              </span>
            </div>
            <p className="text-[#5c4a1a] text-sm">Collaborative worldbuilding for the decentralized age.</p>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h3 className="text-[#ffb300] font-semibold">Platform</h3>
            <div className="space-y-2">
              <Link href="/write" className="block text-[#a3a380] hover:text-[#ffb300] transition-colors text-sm">
                Write Lore
              </Link>
              <Link href="/lore" className="block text-[#a3a380] hover:text-[#ffb300] transition-colors text-sm">
                Browse Canon
              </Link>
              <Link href="/me" className="block text-[#a3a380] hover:text-[#ffb300] transition-colors text-sm">
                My Submissions
              </Link>
            </div>
          </div>

          {/* Community */}
          <div className="space-y-4">
            <h3 className="text-[#ffb300] font-semibold">Community</h3>
            <div className="space-y-2">
              <a href="#" className="block text-[#a3a380] hover:text-[#ffb300] transition-colors text-sm">
                Discord
              </a>
              <a href="#" className="block text-[#a3a380] hover:text-[#ffb300] transition-colors text-sm">
                Twitter
              </a>
              <a href="#" className="block text-[#a3a380] hover:text-[#ffb300] transition-colors text-sm">
                GitHub
              </a>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-[#ffb300] font-semibold">Resources</h3>
            <div className="space-y-2">
              <a href="#" className="block text-[#a3a380] hover:text-[#ffb300] transition-colors text-sm">
                Documentation
              </a>
              <a href="#" className="block text-[#a3a380] hover:text-[#ffb300] transition-colors text-sm">
                API
              </a>
              <a href="#" className="block text-[#a3a380] hover:text-[#ffb300] transition-colors text-sm">
                Whitepaper
              </a>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-[#ffb300] font-semibold">Contact</h3>
            <div className="space-y-2">
              <a href="#" className="block text-[#a3a380] hover:text-[#ffb300] transition-colors text-sm">Email</a>
              <a href="#" className="block text-[#a3a380] hover:text-[#ffb300] transition-colors text-sm">Support</a>
            </div>
          </div>
        </div>

        <div className="border-t border-[#f5e6b2] mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-[#a3a380] text-sm">© 2025 LoreChain. Building the future of collaborative storytelling.</p>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <a href="#" className="text-[#a3a380] hover:text-[#ffb300] transition-colors">
              <Github className="h-5 w-5" />
            </a>
            <a href="#" className="text-[#a3a380] hover:text-[#ffb300] transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="text-[#a3a380] hover:text-[#ffb300] transition-colors">
              <Discord className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

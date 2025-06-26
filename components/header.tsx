"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, User, LogOut } from "lucide-react"
import { useAccount } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useDisconnect } from "wagmi"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Write", href: "/write" },
    { name: "Lore", href: "/lore" },
    { name: "My Lore", href: "/me" },
  ]

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">LC</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                LoreChain
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href} className="text-slate-300 hover:text-white transition-colors">
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Wallet Connection */}
            <div className="flex items-center space-x-4">
              {isConnected ? (
                <div className="hidden sm:flex items-center space-x-2">
                  <span className="bg-green-600/20 text-green-400 border-green-500/50 px-2 py-1 rounded-full flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
                    Wallet Connected
                  </span>
                  <span className="text-slate-300 font-mono text-sm">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => disconnect()}
                    className="text-slate-400 hover:text-white"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <ConnectButton />
              )}

              {/* Mobile Menu */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-slate-900 border-slate-800">
                  <div className="flex flex-col space-y-4 mt-8">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="text-slate-300 hover:text-white transition-colors text-lg"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                    {isConnected && (
                      <div className="pt-4 border-t border-slate-800">
                        <div className="flex items-center space-x-2 mb-2">
                          <User className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-300 font-mono text-sm">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}

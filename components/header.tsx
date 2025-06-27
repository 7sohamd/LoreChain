"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, User, LogOut } from "lucide-react"
import { auth, provider, updateUserWalletAddress } from "@/lib/firebase"
import type { User as FirebaseUser } from "firebase/auth"
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth"
import { useWeb3 } from "@/components/Web3Provider"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const { walletAddress, connectWallet, disconnectWallet } = useWeb3()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser)
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (user && walletAddress) {
      updateUserWalletAddress(user.uid, walletAddress)
    }
  }, [user, walletAddress])

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider)
    } catch (err) {
      alert("Failed to sign in with Google")
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth)
    } catch (err) {
      alert("Failed to sign out")
    }
  }

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Write", href: "/write" },
    { name: "Lore", href: "/lore" },
    { name: "My Lore", href: "/me" },
    { name: "Monetization", href: "/monetization" },
    { name: "Story Maker", href: "/story-maker" },
    { name: "Podcast", href: "/podcast" },
  ]

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-[#fff9de]/10 backdrop-blur border-b border-[#f5e6b2]">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-br from-[#ffb300] to-[#fffbe9] rounded-lg flex items-center justify-center">
                <span className="text-[#3d2c00] font-bold text-sm">LC</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#ffb300] to-[#a3a380] bg-clip-text text-transparent">
                LoreChain
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href} className="text-[#3d2c00] hover:text-[#ffb300] transition-colors font-medium">
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* User Auth + Wallet */}
            <div className="hidden sm:flex items-center space-x-2">
              {user ? (
                <>
                  <span className="text-[#3d2c00] font-mono text-sm">{user.displayName || user.email}</span>
                  {walletAddress ? (
                    <>
                      <span className="text-[#388e3c] font-mono text-xs bg-[#fffbe9] px-2 py-1 rounded">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
                      <Button variant="ghost" size="sm" onClick={disconnectWallet} className="text-[#388e3c] hover:text-[#3d2c00]">
                        Disconnect Wallet
                      </Button>
                    </>
                  ) : (
                    <Button className="bg-[#ffb300] text-[#3d2c00] shadow hover:bg-[#ffd54f]" size="sm" onClick={connectWallet}>Connect Wallet</Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-[#3d2c00] hover:text-[#ffb300]">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" className="text-[#a3a380] border-[#ffb300] hover:text-[#3d2c00] bg-[#fff9de]" onClick={handleSignIn}>Sign In</Button>
              )}
            </div>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5 text-[#ffb300]" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#fff9de] border-[#f5e6b2]">
                <div className="flex flex-col space-y-4 mt-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-[#3d2c00] hover:text-[#ffb300] transition-colors text-lg font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  {/* User Auth for mobile */}
                  {user ? (
                    <Button variant="outline" size="sm" className="text-[#a3a380] hover:text-[#ffb300] mt-4 border-[#ffb300] bg-[#fff9de]" onClick={handleSignOut}>Sign Out</Button>
                  ) : (
                    <Button variant="outline" size="sm" className="text-[#a3a380] hover:text-[#ffb300] mt-4 border-[#ffb300] bg-[#fff9de]" onClick={handleSignIn}>Sign In</Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  )
}

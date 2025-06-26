"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, User, LogOut } from "lucide-react"
import { auth, provider } from "@/lib/firebase"
import type { User as FirebaseUser } from "firebase/auth"
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<FirebaseUser | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser)
    return () => unsubscribe()
  }, [])

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
    { name: "Story Maker", href: "/story-maker" },
    { name: "Podcast", href: "/podcast" },
  ]

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-md border-b border-blue-100">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-400 to-blue-200 rounded-lg flex items-center justify-center">
                <span className="text-blue-700 font-bold text-sm">LC</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-400 bg-clip-text text-transparent">
                LoreChain
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href} className="text-slate-700 hover:text-blue-700 transition-colors">
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* User Auth */}
            <div className="hidden sm:flex items-center space-x-2">
              {user ? (
                <>
                  <span className="text-slate-700 font-mono text-sm">{user.displayName || user.email}</span>
                  <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-blue-700 hover:text-blue-900">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" className="text-blue-700 hover:text-blue-900 border-blue-200" onClick={handleSignIn}>Sign In</Button>
              )}
            </div>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5 text-blue-700" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-white border-blue-100">
                <div className="flex flex-col space-y-4 mt-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-slate-700 hover:text-blue-700 transition-colors text-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  {/* User Auth for mobile */}
                  {user ? (
                    <Button variant="outline" size="sm" className="text-blue-700 hover:text-blue-900 mt-4 border-blue-200" onClick={handleSignOut}>Sign Out</Button>
                  ) : (
                    <Button variant="outline" size="sm" className="text-blue-700 hover:text-blue-900 mt-4 border-blue-200" onClick={handleSignIn}>Sign In</Button>
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

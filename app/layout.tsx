import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Web3Provider } from "@/components/Web3Provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LoreChain - Collaborative Universe Building",
  description: "AI-assisted, community-voted, immutable lore on-chain. Write the next universe together.",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Web3Provider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Web3Provider>
      </body>
    </html>
  )
}

"use client";

import React, { createContext, useContext, useState } from "react"
import { ethers } from "ethers"

interface Web3ContextType {
  walletAddress: string | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
        setWalletAddress(accounts[0])
      } catch (err) {
        alert("Wallet connection failed")
      }
    } else {
      alert("No Ethereum wallet found. Please install MetaMask or similar.")
    }
  }

  const disconnectWallet = () => {
    setWalletAddress(null)
  }

  return (
    <Web3Context.Provider value={{ walletAddress, connectWallet, disconnectWallet }}>
      {children}
    </Web3Context.Provider>
  )
}

export const useWeb3 = () => {
  const context = useContext(Web3Context)
  if (!context) throw new Error("useWeb3 must be used within a Web3Provider")
  return context
} 
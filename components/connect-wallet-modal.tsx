"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ConnectButton } from "@rainbow-me/rainbowkit"

interface ConnectWalletModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ConnectWalletModal({ isOpen, onClose }: ConnectWalletModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            Connect Wallet
          </DialogTitle>
        </DialogHeader>
        <div className="flex justify-center mt-6">
          <ConnectButton />
        </div>
      </DialogContent>
    </Dialog>
  )
}

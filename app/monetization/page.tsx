"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Share2, 
  Crown, 
  Gift, 
  Users, 
  DollarSign, 
  Copy, 
  CheckCircle, 
  Star,
  TrendingUp,
  CreditCard,
  Zap
} from "lucide-react"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth"
import { collection, addDoc, getDocs, query, where, updateDoc, doc, getDoc } from "firebase/firestore"
import { cn } from "@/lib/utils"

interface UserCredits {
  credits: number
  referralCode: string
  referredBy?: string
  totalEarned: number
  referralsCount: number
}

interface Subscription {
  id: string
  name: string
  credits: number
  price: number
  popular?: boolean
  features: string[]
}

export default function MonetizationPage() {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [userCredits, setUserCredits] = useState<UserCredits>({
    credits: 0,
    referralCode: "",
    totalEarned: 0,
    referralsCount: 0
  })
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState("earn")

  const subscriptions: Subscription[] = [
    {
      id: "basic",
      name: "Starter Pack",
      credits: 100,
      price: 1,
      features: ["100 Credits", "Basic Support", "Standard Features"]
    },
    {
      id: "pro",
      name: "Creator Pro",
      credits: 500,
      price: 4,
      popular: true,
      features: ["500 Credits", "Priority Support", "Advanced Features", "Exclusive Content"]
    },
    {
      id: "premium",
      name: "Unlimited",
      credits: 1500,
      price: 10,
      features: ["1500 Credits", "24/7 Support", "All Features", "Exclusive Content", "Early Access"]
    }
  ]

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
      if (firebaseUser) {
        fetchUserCredits(firebaseUser.uid)
      }
    })
    return () => unsubscribe()
  }, [])

  const fetchUserCredits = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, "userCredits", userId))
      if (userDoc.exists()) {
        setUserCredits(userDoc.data() as UserCredits)
      } else {
        // Create new user credits document
        const referralCode = generateReferralCode()
        const newUserCredits: UserCredits = {
          credits: 0,
          referralCode,
          totalEarned: 0,
          referralsCount: 0
        }
        await addDoc(collection(db, "userCredits"), {
          userId,
          ...newUserCredits
        })
        setUserCredits(newUserCredits)
      }
    } catch (error) {
      console.error("Error fetching user credits:", error)
    }
  }

  const generateReferralCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const handleCopyReferral = async () => {
    const referralUrl = `${window.location.origin}?ref=${userCredits.referralCode}`
    await navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePurchaseCredits = async (subscription: Subscription) => {
    if (!user) return
    // Here you would integrate with your payment processor
    alert(`Redirecting to payment for ${subscription.name} - $${subscription.price}`)
  }

  if (loading) {
    return <div className="text-center py-12 text-[#5c4a1a]">Loading...</div>
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#fff9de] ">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-[#3d2c00] mb-4">Monetization Center</h1>
            <p className="text-[#5c4a1a] text-lg font-mono mb-8">
              Sign in to access your credits and start earning!
            </p>
            <Button className="bg-[#ffb300] text-[#3d2c00] hover:bg-[#ffd54f] font-bold">
              Sign In to Continue
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fff9de] py-8 pt-24">
      {/* Dot Background */}
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:12px_12px]",
          "[background-image:radial-gradient(#3d2c00_1px,transparent_1px)]"
        )} />
      
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#3d2c00] mb-4">
            Monetization Center
          </h1>
          <p className="text-[#5c4a1a] text-lg font-mono">
            Earn credits by sharing and unlock premium features
          </p>
        </div>

        {/* Credits Overview */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white border border-[#f5e6b2]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#5c4a1a] text-sm font-mono">Current Credits</p>
                  <p className="text-2xl font-bold text-[#3d2c00]">{userCredits.credits}</p>
                </div>
                <Zap className="h-8 w-8 text-[#ffb300]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-[#f5e6b2]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#5c4a1a] text-sm font-mono">Total Earned</p>
                  <p className="text-2xl font-bold text-[#3d2c00]">{userCredits.totalEarned}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-[#ffb300]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-[#f5e6b2]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#5c4a1a] text-sm font-mono">Referrals</p>
                  <p className="text-2xl font-bold text-[#3d2c00]">{userCredits.referralsCount}</p>
                </div>
                <Users className="h-8 w-8 text-[#ffb300]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-[#fff9de] border-[#f5e6b2] grid w-full grid-cols-2">
            <TabsTrigger 
              value="earn" 
              className="text-[#3d2c00] data-[state=active]:bg-[#ffb300] data-[state=active]:text-[#3d2c00]"
            >
              <Gift className="mr-2 h-4 w-4" />
              Earn Credits
            </TabsTrigger>
            <TabsTrigger 
              value="buy" 
              className="text-[#3d2c00] data-[state=active]:bg-[#ffb300] data-[state=active]:text-[#3d2c00]"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Buy Credits
            </TabsTrigger>
          </TabsList>

          {/* Earn Credits Tab */}
          <TabsContent value="earn" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Referral System */}
              <Card className="bg-white border border-[#f5e6b2]">
                <CardHeader>
                  <CardTitle className="text-[#3d2c00] flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-[#ffb300]" />
                    Refer Friends & Earn
                  </CardTitle>
                  <CardDescription className="text-[#5c4a1a] font-mono">
                    Share your referral link and earn 10 credits for each friend who signs up
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#3d2c00]">Your Referral Link</label>
                    <div className="flex gap-2">
                      <Input
                        value={`${window.location.origin}?ref=${userCredits.referralCode}`}
                        readOnly
                        className="bg-[#fff9de] border-[#f5e6b2] text-[#3d2c00] font-mono text-sm"
                      />
                      <Button
                        onClick={handleCopyReferral}
                        variant="outline"
                        className="border-[#ffb300] text-[#3d2c00] hover:bg-[#ffb300] hover:text-[#3d2c00]"
                      >
                        {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="bg-[#fff9de] p-4 rounded-lg border border-[#f5e6b2]">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-4 w-4 text-[#ffb300]" />
                      <span className="text-sm font-medium text-[#3d2c00]">How it works:</span>
                    </div>
                    <ul className="text-sm text-[#5c4a1a] font-mono space-y-1">
                      <li>• Share your unique referral link</li>
                      <li>• Friends sign up using your link</li>
                      <li>• You both get 10 credits instantly</li>
                      <li>• No limit on referrals!</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Rewards History */}
              <Card className="bg-white border border-[#f5e6b2]">
                <CardHeader>
                  <CardTitle className="text-[#3d2c00] flex items-center gap-2">
                    <Crown className="h-5 w-5 text-[#ffb300]" />
                    Rewards History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-[#fff9de] rounded-lg">
                      <div>
                        <p className="text-[#3d2c00] font-medium">Referral Bonus</p>
                        <p className="text-sm text-[#5c4a1a] font-mono">Friend signed up</p>
                      </div>
                      <Badge className="bg-[#ffb300] text-[#3d2c00]">+10</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-[#fff9de] rounded-lg">
                      <div>
                        <p className="text-[#3d2c00] font-medium">Welcome Bonus</p>
                        <p className="text-sm text-[#5c4a1a] font-mono">New user reward</p>
                      </div>
                      <Badge className="bg-[#ffb300] text-[#3d2c00]">+50</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Buy Credits Tab */}
          <TabsContent value="buy" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#3d2c00] mb-2">Purchase Credits</h2>
              <p className="text-[#5c4a1a] font-mono">
                Get instant credits to unlock premium features and support LoreChain
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {subscriptions.map((subscription) => (
                <Card 
                  key={subscription.id} 
                  className={cn(
                    "bg-white border border-[#f5e6b2] relative",
                    subscription.popular && "border-[#ffb300] ring-2 ring-[#ffb300]/20"
                  )}
                >
                  {subscription.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-[#ffb300] text-[#3d2c00] font-bold">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-[#3d2c00]">{subscription.name}</CardTitle>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl font-bold text-[#3d2c00]">${subscription.price}</span>
                      <span className="text-[#5c4a1a] font-mono">USD</span>
                    </div>
                    <div className="text-2xl font-bold text-[#ffb300]">
                      {subscription.credits} Credits
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {subscription.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-[#5c4a1a] font-mono">
                          <CheckCircle className="h-4 w-4 text-[#ffb300] flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => handlePurchaseCredits(subscription)}
                      className={cn(
                        "w-full font-bold",
                        subscription.popular
                          ? "bg-[#ffb300] text-[#3d2c00] hover:bg-[#ffd54f]"
                          : "bg-[#3d2c00] text-white hover:bg-[#5c4a1a]"
                      )}
                    >
                      <DollarSign className="mr-2 h-4 w-4" />
                      Purchase Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Credit Usage Info */}
            <Card className="bg-white border border-[#f5e6b2]">
              <CardHeader>
                <CardTitle className="text-[#3d2c00]">What can you do with credits?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-[#3d2c00]">Premium Features</h4>
                    <ul className="space-y-2 text-sm text-[#5c4a1a] font-mono">
                      <li>• Advanced AI suggestions (5 credits)</li>
                      <li>• Priority story review (10 credits)</li>
                      <li>• Custom story themes (15 credits)</li>
                      <li>• Extended story length (20 credits)</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-[#3d2c00]">Exclusive Content</h4>
                    <ul className="space-y-2 text-sm text-[#5c4a1a] font-mono">
                      <li>• Early access to new features (25 credits)</li>
                      <li>• Exclusive writing prompts (10 credits)</li>
                      <li>• Professional editing (50 credits)</li>
                      <li>• Story illustration (100 credits)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 
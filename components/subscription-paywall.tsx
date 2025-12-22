"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Mic, MessageSquare, Sparkles, Users, Check } from "lucide-react"
import { useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useState } from "react"
import { SUBSCRIPTION_PRICE } from "@/lib/subscription"

interface SubscriptionPaywallProps {
  isOpen: boolean
  onClose: () => void
}

const PREMIUM_FEATURES = [
  {
    icon: Sparkles,
    title: "Subconscious Pattern Analysis",
    description: "Advanced AI reveals the hidden beliefs, recurring themes, and blind spots in your writing.",
  },
  {
    icon: MessageSquare,
    title: "Conversations with Legends",
    description: "Talk through your patterns with Jung, Jesus, Seneca, Buddha — mentors who understand your psyche.",
  },
  {
    icon: Mic,
    title: "Voice Introspection",
    description: "Speak your truth aloud. AI listens for what you reveal when you're not editing yourself.",
  },
  {
    icon: Users,
    title: "Ten Legendary Guides",
    description: "Each brings a different lens to your inner world. Choose based on what you need to hear.",
  },
]

export function SubscriptionPaywall({ isOpen, onClose }: SubscriptionPaywallProps) {
  const createCheckout = useAction(api.polar.createCheckout)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubscribe = async () => {
    setIsLoading(true)
    try {
      const { url } = await createCheckout({})
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error("Checkout error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-background/95 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative w-full max-w-2xl bg-card border border-border rounded-sm shadow-2xl overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors z-10"
            >
              <X size={20} />
            </button>

            <div className="p-8 md:p-12">
              <div className="text-center mb-10">
                <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
                  Unlock the Full Experience
                </p>
                <h2 className="font-serif text-3xl md:text-4xl text-foreground tracking-tight mb-4">
                  See what you've been missing.
                </h2>
                <p className="font-serif text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                  AI-powered analysis of your subconscious patterns. Conversations with history's greatest minds about what it reveals.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                {PREMIUM_FEATURES.map((feature) => (
                  <div
                    key={feature.title}
                    className="flex gap-4 p-4 rounded-sm bg-foreground/[0.02] border border-border/50"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center">
                      <feature.icon size={18} className="text-foreground/70" />
                    </div>
                    <div>
                      <h3 className="font-serif text-base text-foreground mb-1">
                        {feature.title}
                      </h3>
                      <p className="font-sans text-xs text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <div className="font-serif text-4xl text-foreground">
                    {SUBSCRIPTION_PRICE}
                    <span className="text-lg text-muted-foreground">/month</span>
                  </div>
                  <p className="font-sans text-xs text-muted-foreground tracking-wide">
                    Cancel anytime. No questions asked.
                  </p>
                </div>

                <button
                  onClick={handleSubscribe}
                  disabled={isLoading}
                  className="w-full md:w-auto px-12 py-4 bg-foreground text-background font-sans text-sm tracking-widest uppercase hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isLoading ? "Opening checkout..." : "Unlock Now"}
                </button>

                <button
                  onClick={onClose}
                  className="block mx-auto font-sans text-xs text-muted-foreground hover:text-foreground transition-colors tracking-wider"
                >
                  Maybe later
                </button>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            <div className="px-8 md:px-12 py-6 bg-foreground/[0.02]">
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Check size={12} className="text-foreground/50" />
                  Subconscious pattern analysis
                </span>
                <span className="flex items-center gap-1.5">
                  <Check size={12} className="text-foreground/50" />
                  Conversations with 10 guides
                </span>
                <span className="flex items-center gap-1.5">
                  <Check size={12} className="text-foreground/50" />
                  Voice introspection
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

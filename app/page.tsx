"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Mic, MessageSquare, Sparkles, PenLine, Users, ChevronDown, Check } from "lucide-react"
import { SUBSCRIPTION_PRICE } from "@/lib/subscription"
import { useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useState } from "react"

const GUIDES = [
  { name: "Carl Jung", subtitle: "The Shadow Analyst", image: "/guides/carl-jung.webp" },
  { name: "Jesus", subtitle: "The Compassionate Healer", image: "/guides/jesus.webp" },
  { name: "Nietzsche", subtitle: "The Will to Power", image: "/guides/nietzsche.jpg" },
  { name: "Seneca", subtitle: "The Stoic Sage", image: "/guides/seneca.webp" },
  { name: "Buddha", subtitle: "The Enlightened One", image: "/guides/buddha.webp" },
  { name: "Socrates", subtitle: "The Questioner", image: "/guides/socrates.png" },
  { name: "Marcus Aurelius", subtitle: "The Philosopher King", image: "/guides/marcus-aurelius.jpeg" },
  { name: "Lao Tzu", subtitle: "The Taoist Master", image: "/guides/lao-tzu.jpg" },
  { name: "Rumi", subtitle: "The Mystic Poet", image: "/guides/rumi.jpg" },
  { name: "Sigmund Freud", subtitle: "The Dream Interpreter", image: "/guides/freud.webp" },
]

const FEATURES = [
  {
    icon: PenLine,
    title: "The Daily Practice",
    description: "Seven days of reflection. One elegant interface. Build the habit of introspection with guided journaling cycles.",
  },
  {
    icon: Users,
    title: "Choose Your Guide",
    description: "Ten legendary minds await. Select a philosopher, mystic, or healer to analyze your week through their unique lens.",
  },
  {
    icon: Mic,
    title: "Voice Sessions",
    description: "Speak your truth aloud. Answer ten introspective questions while your guide listens, transcribes, and understands.",
  },
  {
    icon: Sparkles,
    title: "The Diagnosis",
    description: "Receive a personalized analysis of your inner world. Patterns revealed. Shadows illuminated. Growth paths suggested.",
  },
  {
    icon: MessageSquare,
    title: "Ongoing Conversations",
    description: "The dialogue continues. Ask questions. Go deeper. Your guide remembers everything.",
  },
]

export default function LandingPage() {
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

  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-foreground/10">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto"
        >
          <p className="font-sans text-xs tracking-[0.4em] uppercase text-muted-foreground mb-6">
            A Journal for the Inner Life
          </p>
          
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-foreground tracking-tight leading-[1.1] mb-6">
            Your thoughts deserve
            <br />
            <span className="italic">a masterpiece.</span>
          </h1>
          
          <p className="font-serif text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed mb-10">
            Write daily. Reflect weekly. Then sit with history's greatest minds as they analyze your inner world.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/journal"
              className="px-8 py-4 bg-foreground text-background font-sans text-sm tracking-widest uppercase hover:opacity-90 transition-opacity"
            >
              Start Writing Free
            </Link>
            <button
              onClick={scrollToFeatures}
              className="px-8 py-4 border border-border font-sans text-sm tracking-widest uppercase text-muted-foreground hover:text-foreground hover:border-foreground transition-all"
            >
              See What's Inside
            </button>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          onClick={scrollToFeatures}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronDown size={24} className="animate-bounce" />
        </motion.button>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 md:py-32 px-6 bg-foreground/[0.02]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 md:mb-20"
          >
            <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
              The Experience
            </p>
            <h2 className="font-serif text-3xl md:text-5xl text-foreground tracking-tight">
              Not just a journal.
              <br />
              <span className="text-muted-foreground">A companion.</span>
            </h2>
          </motion.div>

          <div className="space-y-6 md:space-y-8">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col md:flex-row gap-6 p-6 md:p-8 bg-card border border-border rounded-sm"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center">
                  <feature.icon size={22} className="text-foreground/70" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-xl md:text-2xl text-foreground">
                    {feature.title}
                  </h3>
                  <p className="font-serif text-base md:text-lg text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Guides Section */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
              Your Guides
            </p>
            <h2 className="font-serif text-3xl md:text-5xl text-foreground tracking-tight mb-4">
              Ten minds. Millennia of wisdom.
            </h2>
            <p className="font-serif text-lg text-muted-foreground max-w-lg mx-auto">
              Each brings a different lens through which to understand your inner world.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
            {GUIDES.map((guide, index) => (
              <motion.div
                key={guide.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group relative aspect-[3/4] overflow-hidden bg-foreground rounded-sm"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{
                    backgroundImage: `url('${guide.image}')`,
                    filter: "grayscale(100%) contrast(1.1)",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/50 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
                  <h3 className="font-serif text-sm md:text-base text-background">
                    {guide.name}
                  </h3>
                  <p className="font-sans text-[10px] md:text-xs text-background/60 mt-0.5">
                    {guide.subtitle}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Philosophy */}
      <section className="py-24 md:py-32 px-6 bg-foreground text-background">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <blockquote className="font-serif text-2xl md:text-4xl leading-relaxed mb-8 italic">
              "The unexamined life is not worth living."
            </blockquote>
            <p className="font-sans text-sm tracking-widest uppercase text-background/60">
              — Socrates
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 md:py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
              Simple Pricing
            </p>
            <h2 className="font-serif text-3xl md:text-5xl text-foreground tracking-tight">
              For those who value depth.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Free Tier */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="p-8 border border-border rounded-sm"
            >
              <div className="mb-8">
                <h3 className="font-serif text-xl text-foreground mb-2">Free</h3>
                <div className="font-serif text-4xl text-foreground">
                  $0
                  <span className="text-lg text-muted-foreground">/forever</span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check size={18} className="text-foreground/50 mt-0.5 flex-shrink-0" />
                  <span className="font-sans text-sm text-muted-foreground">Unlimited journal entries</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check size={18} className="text-foreground/50 mt-0.5 flex-shrink-0" />
                  <span className="font-sans text-sm text-muted-foreground">Elegant writing interface</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check size={18} className="text-foreground/50 mt-0.5 flex-shrink-0" />
                  <span className="font-sans text-sm text-muted-foreground">Entry history & organization</span>
                </li>
              </ul>

              <Link
                href="/journal"
                className="block w-full text-center py-4 border border-border font-sans text-sm tracking-widest uppercase text-foreground hover:bg-foreground/5 transition-colors"
              >
                Start Writing
              </Link>
            </motion.div>

            {/* Premium Tier */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-8 bg-foreground text-background rounded-sm relative overflow-hidden"
            >
              <div className="absolute top-4 right-4">
                <span className="font-sans text-[10px] tracking-widest uppercase px-3 py-1 bg-background/10 rounded-full">
                  Recommended
                </span>
              </div>

              <div className="mb-8">
                <h3 className="font-serif text-xl text-background mb-2">Premium</h3>
                <div className="font-serif text-4xl text-background">
                  {SUBSCRIPTION_PRICE}
                  <span className="text-lg text-background/60">/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check size={18} className="text-background/70 mt-0.5 flex-shrink-0" />
                  <span className="font-sans text-sm text-background/80">Everything in Free</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check size={18} className="text-background/70 mt-0.5 flex-shrink-0" />
                  <span className="font-sans text-sm text-background/80">All 10 philosophical guides</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check size={18} className="text-background/70 mt-0.5 flex-shrink-0" />
                  <span className="font-sans text-sm text-background/80">Voice interview sessions</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check size={18} className="text-background/70 mt-0.5 flex-shrink-0" />
                  <span className="font-sans text-sm text-background/80">AI-powered analysis & diagnosis</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check size={18} className="text-background/70 mt-0.5 flex-shrink-0" />
                  <span className="font-sans text-sm text-background/80">Unlimited conversations with guides</span>
                </li>
              </ul>

              <button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="block w-full text-center py-4 bg-background text-foreground font-sans text-sm tracking-widest uppercase hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isLoading ? "Opening checkout..." : "Unlock Guides"}
              </button>
            </motion.div>
          </div>

          <p className="text-center font-sans text-xs text-muted-foreground mt-8">
            Cancel anytime. No questions asked. Your journal entries are always yours.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 md:py-32 px-6 border-t border-border">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="font-serif text-3xl md:text-4xl text-foreground tracking-tight mb-6">
            Begin your journey.
          </h2>
          <p className="font-serif text-lg text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed">
            Your inner world deserves the same attention you give the outer one.
          </p>
          <Link
            href="/journal"
            className="inline-block px-10 py-5 bg-foreground text-background font-sans text-sm tracking-widest uppercase hover:opacity-90 transition-opacity"
          >
            Start Writing
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-serif text-sm text-muted-foreground">
            Journal — A Space for Reflection
          </p>
          <p className="font-sans text-xs text-muted-foreground">
            For those who value depth over distraction.
          </p>
        </div>
      </footer>
    </div>
  )
}

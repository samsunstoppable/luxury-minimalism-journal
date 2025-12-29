"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Mic, MessageSquare, Sparkles, PenLine, Brain, ChevronDown, Check } from "lucide-react"
import { SUBSCRIPTION_PRICE } from "@/lib/subscription"
import { useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useState } from "react"
import { toast } from "sonner"
import { Footer } from "@/components/footer"

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
  { name: "Sigmund Freud", subtitle: "The Dream Interpreter", image: "/placeholder-user.jpg" },
]

const IllustrationWrite = () => (
  <svg viewBox="0 0 400 300" className="w-full h-full opacity-[0.03] dark:opacity-[0.05]" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="50" y="40" width="300" height="220" rx="2" stroke="currentColor" strokeWidth="1" />
    <line x1="80" y1="80" x2="320" y2="80" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
    <line x1="80" y1="110" x2="320" y2="110" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
    <line x1="80" y1="140" x2="260" y2="140" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
    <circle cx="330" cy="240" r="15" stroke="currentColor" strokeWidth="1" />
    <path d="M325 240L335 240M330 235L330 245" stroke="currentColor" strokeWidth="1" />
  </svg>
)

const IllustrationAnalysis = () => (
  <svg viewBox="0 0 400 300" className="w-full h-full opacity-[0.03] dark:opacity-[0.05]" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="200" cy="150" r="80" stroke="currentColor" strokeWidth="1" strokeDasharray="8 8" />
    <circle cx="200" cy="150" r="40" stroke="currentColor" strokeWidth="1" />
    <path d="M160 110L240 190M240 110L160 190" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    <rect x="280" y="60" width="60" height="20" rx="10" stroke="currentColor" strokeWidth="1" />
    <rect x="60" y="220" width="80" height="20" rx="10" stroke="currentColor" strokeWidth="1" />
  </svg>
)

const IllustrationGuide = () => (
  <svg viewBox="0 0 400 300" className="w-full h-full opacity-[0.03] dark:opacity-[0.05]" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M80 60H320V200H180L140 240V200H80V60Z" stroke="currentColor" strokeWidth="1" />
    <circle cx="130" cy="110" r="20" stroke="currentColor" strokeWidth="1" />
    <line x1="170" y1="100" x2="270" y2="100" stroke="currentColor" strokeWidth="1" />
    <line x1="170" y1="120" x2="240" y2="120" stroke="currentColor" strokeWidth="1" />
  </svg>
)

const IllustrationVoice = () => (
  <svg viewBox="0 0 400 300" className="w-full h-full opacity-[0.03] dark:opacity-[0.05]" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M100 150C120 100 150 100 170 150C190 200 220 200 240 150C260 100 290 100 310 150" stroke="currentColor" strokeWidth="1" />
    <path d="M100 170C120 120 150 120 170 170C190 220 220 220 240 170C260 120 290 120 310 170" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    <path d="M100 130C120 80 150 80 170 130C190 180 220 180 240 130C260 80 290 80 310 130" stroke="currentColor" strokeWidth="1" opacity="0.5" />
  </svg>
)

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
      toast.error("Failed to start checkout. Please try again later.")
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
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto"
        >
          <p className="font-sans text-[10px] md:text-xs tracking-[0.4em] uppercase text-muted-foreground mb-6 md:mb-8">
            The World's First AI-Powered Depth Journal
          </p>
          
          <h1 className="font-serif text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-foreground tracking-tight leading-[1.1] mb-6 md:mb-8 text-balance">
            Uncover your
            <br />
            <span className="italic text-foreground/90">subconscious patterns.</span>
          </h1>
          
          <p className="font-serif text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-6">
            Write for seven days. Then sit with Jung, Seneca, or Jesus as they analyze what your conscious mind cannot see.
          </p>

          <p className="font-sans text-xs md:text-sm text-muted-foreground/70 max-w-xl mx-auto mb-10 md:mb-12">
            Advanced agentic AI identifies hidden patterns in your thoughts, beliefs, and behaviors — then lets you explore them in conversation with history's greatest minds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 md:mb-16">
            <Link
              href="/journal"
              className="w-full sm:w-auto px-10 py-5 bg-foreground text-background font-sans text-xs md:text-sm tracking-widest uppercase hover:opacity-90 transition-opacity text-center"
            >
              Begin Your Analysis
            </Link>
            <button
              onClick={scrollToFeatures}
              className="w-full sm:w-auto px-10 py-5 border border-border font-sans text-xs md:text-sm tracking-widest uppercase text-muted-foreground hover:text-foreground hover:border-foreground transition-all"
            >
              How It Works
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

      {/* The Problem / Differentiation */}
      <section className="py-16 md:py-32 px-6 bg-foreground text-background">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <p className="font-sans text-[10px] md:text-xs tracking-[0.3em] uppercase text-background/50 mb-6">
              Beyond Ordinary Journaling
            </p>
            <h2 className="font-serif text-2xl md:text-5xl tracking-tight leading-tight mb-8">
              There are a thousand journals.
              <br />
              <span className="text-background/60">This is the only one that sees you.</span>
            </h2>
            <p className="font-serif text-base md:text-xl text-background/70 max-w-2xl mx-auto leading-relaxed">
              Most journals are empty pages. This one reads between the lines — using the most advanced AI to surface the patterns you repeat, the beliefs that limit you, and the shadows you've never examined. Then it gives you a mentor to explore them with.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Core Value Props */}
      <section id="features" className="py-16 md:py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-20"
          >
            <p className="font-sans text-[10px] md:text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
              The Experience
            </p>
            <h2 className="font-serif text-2xl md:text-5xl text-foreground tracking-tight">
              How it works
            </h2>
          </motion.div>

          {/* Step 1: Write */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-16 md:mb-24"
          >
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-center gap-4">
                <span className="font-serif text-5xl md:text-6xl text-foreground/10">01</span>
                <PenLine size={24} className="text-foreground/70 md:w-7 md:h-7" />
              </div>
              <h3 className="font-serif text-xl md:text-3xl text-foreground">
                Write freely for seven days
              </h3>
              <p className="font-serif text-base md:text-lg text-muted-foreground leading-relaxed">
                An elegant, distraction-free space for your thoughts. No prompts unless you want them. Just you and the page, building a week of authentic reflection.
              </p>
            </div>
            <div className="aspect-[16/10] md:aspect-[4/3] bg-foreground/[0.03] border border-border rounded-sm relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.02] to-transparent" />
              <IllustrationWrite />
            </div>
          </motion.div>

          {/* Step 2: AI Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-16 md:mb-24"
          >
            <div className="order-2 md:order-1 aspect-[16/10] md:aspect-[4/3] bg-foreground/[0.03] border border-border rounded-sm relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-bl from-foreground/[0.02] to-transparent" />
              <IllustrationAnalysis />
            </div>
            <div className="order-1 md:order-2 space-y-4 md:space-y-6">
              <div className="flex items-center gap-4">
                <span className="font-serif text-5xl md:text-6xl text-foreground/10">02</span>
                <Brain size={24} className="text-foreground/70 md:w-7 md:h-7" />
              </div>
              <h3 className="font-serif text-xl md:text-3xl text-foreground">
                AI reveals your hidden patterns
              </h3>
              <p className="font-serif text-base md:text-lg text-muted-foreground leading-relaxed">
                Our agentic AI reads your seven days of entries and identifies what your conscious mind misses: recurring themes, limiting beliefs, emotional patterns, and the stories you tell yourself. This isn't generic advice — it's a mirror.
              </p>
              <p className="font-sans text-[11px] md:text-sm text-muted-foreground/70 border-l-2 border-foreground/20 pl-4">
                "The AI surfaced a pattern I'd been blind to for years. I kept writing about 'not being ready' — for relationships, for career moves, for life. Seeing it laid out changed everything."
              </p>
            </div>
          </motion.div>

          {/* Step 3: Talk to Your Guide */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-16 md:mb-24"
          >
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-center gap-4">
                <span className="font-serif text-5xl md:text-6xl text-foreground/10">03</span>
                <MessageSquare size={24} className="text-foreground/70 md:w-7 md:h-7" />
              </div>
              <h3 className="font-serif text-xl md:text-3xl text-foreground">
                Converse with a legendary mind
              </h3>
              <p className="font-serif text-base md:text-lg text-muted-foreground leading-relaxed">
                Choose your guide — Jung, Jesus, Seneca, Buddha, and more. They receive your analysis and engage you in real conversation. Ask questions. Challenge their observations. Go deeper. They remember everything and respond as the masters themselves would.
              </p>
              <p className="font-sans text-[11px] md:text-sm text-muted-foreground/70 border-l-2 border-foreground/20 pl-4">
                This isn't a chatbot. It's a dialogue with accumulated human wisdom, personalized to your psyche.
              </p>
            </div>
            <div className="aspect-[16/10] md:aspect-[4/3] bg-foreground/[0.03] border border-border rounded-sm relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-foreground/[0.02] to-transparent" />
              <IllustrationGuide />
            </div>
          </motion.div>

          {/* Step 4: Voice Sessions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid md:grid-cols-2 gap-8 md:gap-12 items-center"
          >
            <div className="order-2 md:order-1 aspect-[16/10] md:aspect-[4/3] bg-foreground/[0.03] border border-border rounded-sm relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tl from-foreground/[0.02] to-transparent" />
              <IllustrationVoice />
            </div>
            <div className="order-1 md:order-2 space-y-4 md:space-y-6">
              <div className="flex items-center gap-4">
                <span className="font-serif text-5xl md:text-6xl text-foreground/10">04</span>
                <Mic size={24} className="text-foreground/70 md:w-7 md:h-7" />
              </div>
              <h3 className="font-serif text-xl md:text-3xl text-foreground">
                Speak your truth aloud
              </h3>
              <p className="font-serif text-base md:text-lg text-muted-foreground leading-relaxed">
                Before your analysis, answer ten introspective questions with your voice. Speaking aloud accesses different parts of your mind than writing. The AI transcribes and weaves your spoken words into your analysis — catching what you reveal when you're not editing yourself.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Guides Section */}
      <section className="py-16 md:py-32 px-6 bg-foreground/[0.02]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <p className="font-sans text-[10px] md:text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
              Your Mentors
            </p>
            <h2 className="font-serif text-2xl md:text-5xl text-foreground tracking-tight mb-4">
              Wisdom that shaped humanity.
              <br />
              <span className="text-muted-foreground">Now shaped to you.</span>
            </h2>
            <p className="font-serif text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mt-6 leading-relaxed">
              Each guide brings a different lens. Jung explores your shadow. Seneca challenges your attachments. Jesus meets you with compassion. Buddha points to liberation. Choose based on what you need to hear.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-6">
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
                <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
                  <h3 className="font-serif text-xs md:text-base text-background">
                    {guide.name}
                  </h3>
                  <p className="font-sans text-[9px] md:text-xs text-background/60 mt-0.5">
                    {guide.subtitle}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="py-24 md:py-32 px-6 overflow-hidden">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <blockquote className="font-serif text-xl md:text-4xl leading-relaxed mb-8 italic text-foreground">
              "Until you make the unconscious conscious, it will direct your life and you will call it fate."
            </blockquote>
            <p className="font-sans text-[10px] md:text-sm tracking-widest uppercase text-muted-foreground">
              — Carl Jung
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 md:py-32 px-6 bg-foreground text-background">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <p className="font-sans text-[10px] md:text-xs tracking-[0.3em] uppercase text-background/50 mb-4">
              Investment
            </p>
            <h2 className="font-serif text-2xl md:text-5xl tracking-tight mb-4">
              A luxury for the inner life.
            </h2>
            <p className="font-serif text-base md:text-lg text-background/60 max-w-xl mx-auto leading-relaxed">
              Less than a therapy session. More than any journal you've ever used.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-background text-foreground p-6 sm:p-10 md:p-14 rounded-sm max-w-2xl mx-auto"
          >
            <div className="text-center mb-8 md:mb-10">
              <div className="font-serif text-4xl sm:text-5xl md:text-6xl text-foreground mb-2">
                {SUBSCRIPTION_PRICE}
                <span className="text-xl md:text-2xl text-muted-foreground">/month</span>
              </div>
              <p className="font-sans text-xs md:text-sm text-muted-foreground">
                Cancel anytime. No questions asked.
              </p>
            </div>

            <div className="space-y-4 mb-8 md:mb-10">
              <div className="flex items-start gap-4">
                <Check size={18} className="text-foreground mt-0.5 flex-shrink-0 md:w-5 md:h-5" />
                <div>
                  <p className="font-serif text-sm md:text-base text-foreground">Unlimited journal entries</p>
                  <p className="font-sans text-[10px] md:text-sm text-muted-foreground">Beautiful, distraction-free writing space</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Check size={18} className="text-foreground mt-0.5 flex-shrink-0 md:w-5 md:h-5" />
                <div>
                  <p className="font-serif text-sm md:text-base text-foreground">AI-powered subconscious analysis</p>
                  <p className="font-sans text-[10px] md:text-sm text-muted-foreground">Patterns, beliefs, and blind spots revealed</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Check size={18} className="text-foreground mt-0.5 flex-shrink-0 md:w-5 md:h-5" />
                <div>
                  <p className="font-serif text-sm md:text-base text-foreground">Conversations with 10 legendary guides</p>
                  <p className="font-sans text-[10px] md:text-sm text-muted-foreground">Jung, Jesus, Seneca, Buddha, and more</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Check size={18} className="text-foreground mt-0.5 flex-shrink-0 md:w-5 md:h-5" />
                <div>
                  <p className="font-serif text-sm md:text-base text-foreground">Voice introspection sessions</p>
                  <p className="font-sans text-[10px] md:text-sm text-muted-foreground">Speak your truth, let AI listen deeper</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full py-4 md:py-5 bg-foreground text-background font-sans text-xs md:text-sm tracking-widest uppercase hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? "Opening checkout..." : "Start Your Journey"}
            </button>
          </motion.div>

          <div className="text-center mt-8 md:mt-12">
            <p className="font-serif text-sm md:text-base text-background/50">
              Or{" "}
              <Link href="/journal" className="text-background/80 border-b border-background/30 hover:border-background/60 transition-colors">
                start with free journaling
              </Link>
              {" "}and upgrade when you're ready for the analysis.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 md:py-32 px-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="font-serif text-2xl md:text-4xl text-foreground tracking-tight mb-6">
            What patterns are running your life?
          </h2>
          <p className="font-serif text-base md:text-lg text-muted-foreground mb-10 max-w-lg mx-auto leading-relaxed">
            Seven days of writing. One conversation that changes everything.
          </p>
          <Link
            href="/journal"
            className="inline-block px-10 md:px-12 py-4 md:py-5 bg-foreground text-background font-sans text-xs md:text-sm tracking-widest uppercase hover:opacity-90 transition-opacity"
          >
            Begin Writing
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  )
}

"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, MessageCircle, ChevronRight } from "lucide-react"
import { PersonaCard, type Persona } from "./persona-card"

const PERSONAS: Persona[] = [
  {
    id: "jung",
    name: "Carl Jung",
    subtitle: "The Shadow Analyst",
    imageQuery: "Carl Jung portrait black and white vintage philosopher",
    imageSrc: "/guides/carl-jung.webp",
  },
  {
    id: "seneca",
    name: "Seneca",
    subtitle: "The Stoic Sage",
    imageQuery: "Seneca Roman philosopher marble bust classical",
    imageSrc: "/guides/seneca.webp",
  },
  {
    id: "buddha",
    name: "Buddha",
    subtitle: "The Enlightened One",
    imageQuery: "Buddha portrait serene meditation peaceful",
    imageSrc: "/guides/buddha.webp",
  },
  {
    id: "aurelius",
    name: "Marcus Aurelius",
    subtitle: "The Philosopher King",
    imageQuery: "Marcus Aurelius Roman emperor portrait classical",
    imageSrc: "/guides/marcus-aurelius.jpeg",
  },
  {
    id: "rumi",
    name: "Rumi",
    subtitle: "The Mystic Poet",
    imageQuery: "Rumi Persian poet sufi mystic portrait classical",
    imageSrc: "/guides/rumi.jpg",
  },
  {
    id: "lao-tzu",
    name: "Lao Tzu",
    subtitle: "The Taoist Master",
    imageQuery: "Lao Tzu Chinese philosopher wise elder portrait",
    imageSrc: "/guides/lao-tzu.jpg",
  },
]

interface DailyMentorPromptProps {
  isOpen: boolean
  onClose: () => void
  onStartChat: (persona: Persona) => void
  defaultPersonaId?: string | null
}

export function DailyMentorPrompt({ isOpen, onClose, onStartChat, defaultPersonaId }: DailyMentorPromptProps) {
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(
    defaultPersonaId ? PERSONAS.find(p => p.id === defaultPersonaId) || null : null
  )
  const [showPersonaSelect, setShowPersonaSelect] = useState(!defaultPersonaId)

  const handleQuickStart = () => {
    if (selectedPersona) {
      onStartChat(selectedPersona)
    } else {
      setShowPersonaSelect(true)
    }
  }

  const handleSelectPersona = (persona: Persona) => {
    setSelectedPersona(persona)
  }

  const handleConfirmPersona = () => {
    if (selectedPersona) {
      onStartChat(selectedPersona)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      >
        <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
        
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-background border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>

          {!showPersonaSelect ? (
            <div className="p-8 pt-12 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-foreground/5 flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-foreground" />
              </div>
              
              <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-3">
                Reflect with your mentor?
              </h2>
              <p className="font-sans text-sm text-muted-foreground mb-8 max-w-sm mx-auto leading-relaxed">
                Take a moment to explore what you just wrote with {selectedPersona?.name || "a guide"}.
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleQuickStart}
                  className="w-full py-4 px-6 bg-foreground text-background font-sans text-sm tracking-wider uppercase rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  Start Reflection
                  <ChevronRight size={16} />
                </button>
                
                <button
                  onClick={() => setShowPersonaSelect(true)}
                  className="w-full py-3 px-6 text-muted-foreground font-sans text-xs tracking-wider uppercase hover:text-foreground transition-colors"
                >
                  {selectedPersona ? "Change mentor" : "Choose a mentor"}
                </button>

                <button
                  onClick={onClose}
                  className="w-full py-3 px-6 text-muted-foreground/60 font-sans text-xs tracking-wider hover:text-muted-foreground transition-colors"
                >
                  Skip for now
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 pt-12">
              <h2 className="font-serif text-xl text-foreground mb-2 text-center">
                Choose your mentor
              </h2>
              <p className="font-sans text-xs text-muted-foreground mb-6 text-center">
                Select who will guide today&apos;s reflection
              </p>

              <div className="grid grid-cols-3 gap-2 mb-6 max-h-[50vh] overflow-y-auto">
                {PERSONAS.map((persona) => (
                  <button
                    key={persona.id}
                    onClick={() => handleSelectPersona(persona)}
                    className={`relative aspect-[3/4] overflow-hidden rounded-lg transition-all duration-300 ${
                      selectedPersona?.id === persona.id
                        ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                        : "hover:opacity-80"
                    }`}
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{
                        backgroundImage: persona.imageSrc 
                          ? `url('${persona.imageSrc}')`
                          : `url('/placeholder-user.jpg')`,
                        filter: "grayscale(100%) contrast(1.1)",
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-2">
                      <p className="font-serif text-xs text-background truncate">{persona.name}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPersonaSelect(false)}
                  className="flex-1 py-3 px-4 border border-border text-foreground font-sans text-xs tracking-wider uppercase rounded-lg hover:bg-foreground/5 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmPersona}
                  disabled={!selectedPersona}
                  className="flex-1 py-3 px-4 bg-foreground text-background font-sans text-xs tracking-wider uppercase rounded-lg hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

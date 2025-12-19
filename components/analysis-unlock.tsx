"use client"

import { useState } from "react"
import { PersonaCard, type Persona } from "./persona-card"

const PERSONAS: Persona[] = [
  {
    id: "jung",
    name: "Carl Jung",
    subtitle: "The Shadow Analyst",
    imageQuery: "Carl Jung portrait black and white vintage philosopher",
  },
  {
    id: "jesus",
    name: "Jesus",
    subtitle: "The Compassionate Healer",
    imageQuery: "Jesus Christ portrait classical art serene",
  },
  {
    id: "nietzsche",
    name: "Nietzsche",
    subtitle: "The Will to Power",
    imageQuery: "Friedrich Nietzsche portrait black and white philosopher mustache",
  },
  {
    id: "seneca",
    name: "Seneca",
    subtitle: "The Stoic Sage",
    imageQuery: "Seneca Roman philosopher marble bust classical",
  },
  {
    id: "buddha",
    name: "Buddha",
    subtitle: "The Enlightened One",
    imageQuery: "Buddha portrait serene meditation peaceful",
  },
  {
    id: "socrates",
    name: "Socrates",
    subtitle: "The Questioner",
    imageQuery: "Socrates Greek philosopher portrait classical sculpture",
  },
  {
    id: "aurelius",
    name: "Marcus Aurelius",
    subtitle: "The Philosopher King",
    imageQuery: "Marcus Aurelius Roman emperor portrait classical",
  },
  {
    id: "lao-tzu",
    name: "Lao Tzu",
    subtitle: "The Taoist Master",
    imageQuery: "Lao Tzu Chinese philosopher wise elder portrait",
  },
  {
    id: "freud",
    name: "Sigmund Freud",
    subtitle: "The Dream Interpreter",
    imageQuery: "Sigmund Freud portrait black and white cigar psychoanalyst",
  },
  {
    id: "rumi",
    name: "Rumi",
    subtitle: "The Mystic Poet",
    imageQuery: "Rumi Persian poet sufi mystic portrait classical",
  },
]

interface AnalysisUnlockProps {
  onSelectPersona: (persona: Persona) => void
  onCancel: () => void
}

export function AnalysisUnlock({ onSelectPersona, onCancel }: AnalysisUnlockProps) {
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)

  const handleSelect = (persona: Persona) => {
    setSelectedPersona(persona)
  }

  const handleConfirm = () => {
    if (selectedPersona) {
      onSelectPersona(selectedPersona)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            <button
              onClick={onCancel}
              className="font-sans text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              Back
            </button>
            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </div>
        <div className="h-px bg-border/50" />
      </header>

      {/* Main content */}
      <main className="flex-1 pt-24 md:pt-32 pb-32">
        <div className="max-w-6xl mx-auto px-6">
          {/* Headline */}
          <div className="text-center mb-12 md:mb-16 animate-in fade-in duration-700">
            <h1 className="font-serif text-3xl md:text-5xl text-foreground tracking-tight mb-4">Choose Your Guide.</h1>
            <p className="font-sans text-sm md:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
              Select a perspective through which to explore your seven days of reflection.
            </p>
          </div>

          {/* Persona Grid - 2x5 on desktop, responsive on mobile */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            {PERSONAS.map((persona) => (
              <PersonaCard
                key={persona.id}
                persona={persona}
                isSelected={selectedPersona?.id === persona.id}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Bottom action bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Selection status */}
            <span className="font-sans text-xs text-muted-foreground tracking-wider">
              {selectedPersona ? (
                <span>
                  Selected: <span className="text-foreground">{selectedPersona.name}</span>
                </span>
              ) : (
                "Select a guide to continue"
              )}
            </span>

            {/* Confirm button */}
            <button
              onClick={handleConfirm}
              disabled={!selectedPersona}
              className="font-sans text-xs tracking-widest uppercase text-foreground border-b border-foreground pb-0.5 hover:opacity-60 transition-all duration-300 disabled:opacity-30 disabled:border-muted-foreground disabled:cursor-not-allowed"
            >
              Begin Analysis
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}

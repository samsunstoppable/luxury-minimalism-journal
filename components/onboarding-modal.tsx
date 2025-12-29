"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PenLine, Brain, MessageSquare, ArrowRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

const STEPS = [
  {
    title: "Welcome to Journal",
    description: "A luxury minimalist space designed for profound self-reflection. This is more than a diary; it's a mirror for your subconscious.",
    icon: <PenLine className="w-8 h-8" />,
  },
  {
    title: "The 7-Day Cycle",
    description: "Write freely for seven days. No judgment, no editing. Just your authentic thoughts flowing onto the page.",
    icon: <Brain className="w-8 h-8" />,
  },
  {
    title: "Meet Your Mentors",
    description: "After 7 days, our AI analyzes your entries for hidden patterns and blind spots. Then, you can explore these insights in conversation with history's greatest minds.",
    icon: <MessageSquare className="w-8 h-8" />,
  },
]

export function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-card border border-border p-8 md:p-12 rounded-sm shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center space-y-8">
              <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center text-foreground">
                {STEPS[currentStep].icon}
              </div>

              <div className="space-y-4">
                <h2 className="font-serif text-2xl md:text-3xl tracking-tight">
                  {STEPS[currentStep].title}
                </h2>
                <p className="font-serif text-muted-foreground leading-relaxed">
                  {STEPS[currentStep].description}
                </p>
              </div>

              <div className="flex flex-col w-full gap-4 pt-4">
                <Button
                  onClick={handleNext}
                  className="w-full py-6 font-sans text-xs tracking-[0.2em] uppercase"
                >
                  {currentStep === STEPS.length - 1 ? "Begin Your Journey" : "Next"}
                  <ArrowRight size={14} className="ml-2" />
                </Button>
                
                <div className="flex justify-center gap-2">
                  {STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        i === currentStep ? "bg-foreground" : "bg-foreground/10"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ProgressRing } from "./progress-ring"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Lock } from "lucide-react"

interface DailyEntryProps {
  onSave: (content: string) => void
  onCancel: () => void
  initialContent?: string
  cycleDay?: number
  cycleTotalDays?: number
  onAnalyze?: () => void
  onDebugAdvance?: () => void
}

export function DailyEntry({
  onSave,
  onCancel,
  initialContent = "",
  cycleDay = 4,
  cycleTotalDays = 7,
  onAnalyze,
  onDebugAdvance,
}: DailyEntryProps) {
  const [content, setContent] = useState(initialContent)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isSaved, setIsSaved] = useState(false)

  const today = new Date()
  const formattedDate = today.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  const isAnalyzeEnabled = cycleDay >= cycleTotalDays
  const daysRemaining = cycleTotalDays - cycleDay

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.max(textarea.scrollHeight, 400)}px`
    }
  }, [])

  useEffect(() => {
    adjustHeight()
  }, [content, adjustHeight])

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const handleSave = () => {
    if (content.trim()) {
      onSave(content.trim())
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 2000)
    }
  }

  const handleAnalyze = () => {
    if (isAnalyzeEnabled && onAnalyze) {
      onAnalyze()
    }
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col">
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="max-w-2xl mx-auto px-6">
            <div className="flex items-center justify-between h-16 md:h-20">
              <button
                onClick={onCancel}
                className="font-sans text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                Back
              </button>
              <h1 className="font-serif text-base md:text-lg text-foreground tracking-wide">{formattedDate}</h1>
              <div className="flex items-center gap-3">
                <ProgressRing currentDay={cycleDay} totalDays={cycleTotalDays} />
                {onDebugAdvance && (
                    <button onClick={onDebugAdvance} className="text-muted-foreground/20 hover:text-foreground text-[10px] uppercase font-sans tracking-widest border border-border px-2 py-1 rounded-sm">
                        +1 Day
                    </button>
                )}
              </div>
            </div>
          </div>
          <div className="h-px bg-border/50" />
        </header>

        <main className="flex-1 pt-24 md:pt-28 pb-32">
          <div className="max-w-2xl mx-auto px-6">
            <div className="animate-in fade-in duration-700">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind today..."
                className="w-full font-serif text-xl md:text-2xl text-foreground placeholder:text-muted-foreground/40 bg-transparent border-none outline-none resize-none leading-relaxed tracking-normal"
                style={{ minHeight: "60vh" }}
              />
            </div>
          </div>
        </main>

        <footer className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border/50">
          <div className="max-w-2xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs text-muted-foreground tracking-wider">
                {content.trim().split(/\s+/).filter(Boolean).length} words
              </span>

              <div className="flex items-center gap-6">
                <button
                  onClick={handleSave}
                  disabled={!content.trim()}
                  className="font-sans text-xs tracking-widest uppercase text-foreground hover:opacity-60 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {isSaved ? "Saved" : "Save"}
                </button>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleAnalyze}
                      disabled={!isAnalyzeEnabled}
                      className={`flex items-center gap-2 font-sans text-xs tracking-widest uppercase transition-all duration-300 ${
                        isAnalyzeEnabled
                          ? "text-foreground border-b border-foreground pb-0.5 hover:opacity-60"
                          : "text-muted-foreground/50 cursor-not-allowed"
                      }`}
                    >
                      {!isAnalyzeEnabled && <Lock size={12} />}
                      Analyze
                    </button>
                  </TooltipTrigger>
                  {!isAnalyzeEnabled && (
                    <TooltipContent side="top" className="bg-foreground text-background font-sans text-xs px-3 py-2">
                      <p>
                        Gathering signal... {daysRemaining} {daysRemaining === 1 ? "day" : "days"} remaining.
                      </p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  )
}

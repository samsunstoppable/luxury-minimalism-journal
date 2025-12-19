"use client"

import { useState, useEffect, useRef } from "react"
import type { Entry } from "@/app/page"

interface JournalEntryProps {
  entry: Entry | null
  onSave: (title: string, content: string) => void
  onCancel: () => void
}

export function JournalEntry({ entry, onSave, onCancel }: JournalEntryProps) {
  const [title, setTitle] = useState(entry?.title || "")
  const [content, setContent] = useState(entry?.content || "")
  const titleRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!entry) {
      titleRef.current?.focus()
    }
  }, [entry])

  const handleSave = () => {
    if (content.trim() || title.trim()) {
      onSave(title.trim(), content.trim())
    }
  }

  const currentDate = entry?.date || new Date()

  return (
    <div className="animate-in fade-in duration-500 space-y-8">
      {/* Date */}
      <div className="text-center">
        <time className="text-xs text-muted-foreground font-sans tracking-wider uppercase">
          {currentDate.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
      </div>

      {/* Title input */}
      <input
        ref={titleRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full font-serif text-2xl md:text-3xl text-foreground placeholder:text-muted-foreground/50 bg-transparent border-none outline-none text-center tracking-tight"
      />

      {/* Divider */}
      <div className="flex justify-center">
        <div className="w-12 h-px bg-border" />
      </div>

      {/* Content textarea */}
      <textarea
        ref={contentRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Begin writing..."
        className="w-full min-h-[50vh] font-serif text-lg md:text-xl text-foreground placeholder:text-muted-foreground/50 bg-transparent border-none outline-none resize-none leading-relaxed"
      />

      {/* Actions */}
      <div className="flex justify-center gap-8 pt-8 border-t border-border">
        <button
          onClick={onCancel}
          className="font-sans text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-300"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!content.trim() && !title.trim()}
          className="font-sans text-xs tracking-widest uppercase text-foreground border-b border-foreground pb-0.5 hover:opacity-60 transition-opacity duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Save Entry
        </button>
      </div>
    </div>
  )
}

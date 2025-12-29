"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { X, ArrowUp } from "lucide-react"
import type { Persona } from "./persona-card"
import { useQuery, useMutation, useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

interface DailyMentorChatProps {
  persona: Persona
  chatId: Id<"dailyChats">
  onClose: () => void
}

export function DailyMentorChat({ persona, chatId, onClose }: DailyMentorChatProps) {
  const chat = useQuery(api.dailyChats.get, { chatId })
  const messages = useQuery(api.dailyChats.listMessages, { chatId }) || []
  const sendMessage = useMutation(api.dailyChats.sendMessage)
  const generateReply = useAction(api.actions.generateDailyReflection)
  const generateInitial = useAction(api.actions.generateInitialReflection)

  const [inputValue, setInputValue] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasInitialized = useRef(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages.length])

  useEffect(() => {
    if (chat && messages.length === 0 && !hasInitialized.current) {
      hasInitialized.current = true
      setIsGenerating(true)
      generateInitial({ chatId }).finally(() => setIsGenerating(false))
    }
  }, [chat, messages.length, chatId, generateInitial])

  const handleSend = async () => {
    if (!inputValue.trim() || isGenerating) return

    const content = inputValue
    setInputValue("")
    
    await sendMessage({ chatId, content, role: "user" })
    
    setIsGenerating(true)
    try {
      await generateReply({ chatId, content })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300"
        >
          <X className="w-5 h-5" />
          <span className="font-sans text-xs tracking-widest uppercase">Done</span>
        </button>

        <div className="text-center">
          <span className="font-sans text-xs text-muted-foreground tracking-wider uppercase">
            Daily Reflection with {persona.name}
          </span>
        </div>

        <div className="w-20" />
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {messages.length === 0 && isGenerating && (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-2 text-muted-foreground">
                <div className="w-2 h-2 bg-foreground/40 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-foreground/40 rounded-full animate-pulse delay-150" />
                <div className="w-2 h-2 bg-foreground/40 rounded-full animate-pulse delay-300" />
              </div>
              <p className="font-serif text-sm text-muted-foreground mt-4">
                {persona.name} is reading your entry...
              </p>
            </div>
          )}
          
          {messages.map((message: any) => (
            <motion.div
              key={message._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] md:max-w-[75%] p-5 rounded-2xl ${
                  message.role === "user"
                    ? "bg-foreground text-background font-sans text-sm"
                    : "bg-card border border-border font-serif text-base md:text-lg leading-relaxed"
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            </motion.div>
          ))}
          
          {isGenerating && messages.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="p-5 rounded-2xl bg-card border border-border">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-foreground/40 rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-foreground/40 rounded-full animate-pulse delay-150" />
                  <div className="w-2 h-2 bg-foreground/40 rounded-full animate-pulse delay-300" />
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="p-6 bg-background border-t border-border">
        <div className="max-w-2xl mx-auto relative">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Reply to ${persona.name}...`}
            disabled={isGenerating}
            className="w-full bg-card border border-border rounded-xl px-4 py-4 pr-12 min-h-[60px] max-h-[200px] resize-none focus:outline-none focus:ring-1 focus:ring-foreground transition-all font-serif text-base disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isGenerating}
            className="absolute right-3 bottom-3 p-2 bg-foreground text-background rounded-lg hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center mt-3 font-sans text-xs text-muted-foreground/60">
          This is a quick daily reflection, not a deep analysis session
        </p>
      </footer>
    </div>
  )
}

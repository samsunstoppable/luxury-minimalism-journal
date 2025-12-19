"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Send, ArrowUp } from "lucide-react"
import type { Persona } from "./persona-card"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

interface AnalysisChatProps {
  persona: Persona
  sessionId: string
  onClose: () => void
}

export function AnalysisChat({ persona, sessionId, onClose }: AnalysisChatProps) {
  const session = useQuery(api.sessions.get, { sessionId });
  const messages = useQuery(api.messages.list, { sessionId }) || [];
  const sendMessage = useMutation(api.messages.send);

  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const allMessages = [
      ...(session?.analysis ? [{
          _id: "analysis",
          role: "assistant",
          content: session.analysis,
          timestamp: session.completedAt || Date.now()
      }] : []),
      ...messages
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [allMessages.length])

  const handleSend = async () => {
    if (!inputValue.trim()) return

    const content = inputValue
    setInputValue("")

    // @ts-ignore
    await sendMessage({ sessionId, content, role: "user" })
    
    // Future: Trigger AI reply
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
          <span className="font-sans text-xs tracking-widest uppercase">Close</span>
        </button>

        <div className="text-center">
          <span className="font-sans text-xs text-muted-foreground tracking-wider uppercase">
            Session with {persona.name}
          </span>
        </div>

        <div className="w-20" /> {/* Spacer */}
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {allMessages.length === 0 && !session?.analysis && (
              <div className="text-center text-muted-foreground">Generating diagnosis...</div>
          )}
          
          {allMessages.map((message) => (
            <motion.div
              key={message._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] md:max-w-[75%] p-6 rounded-2xl ${
                  message.role === "user"
                    ? "bg-foreground text-background font-sans"
                    : "bg-card border border-border font-serif text-lg md:text-xl leading-relaxed"
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="p-6 bg-background border-t border-border">
        <div className="max-w-3xl mx-auto relative">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask ${persona.name} something...`}
            className="w-full bg-card border border-border rounded-xl px-4 py-4 pr-12 min-h-[60px] max-h-[200px] resize-none focus:outline-none focus:ring-1 focus:ring-foreground transition-all font-serif text-base"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="absolute right-3 bottom-3 p-2 bg-foreground text-background rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { X } from "lucide-react"

export function CookieBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent")
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted")
    setShow(false)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-6 right-6 z-[100] md:left-auto md:right-6 md:w-96"
        >
          <div className="bg-foreground text-background p-6 rounded-sm shadow-2xl relative">
            <button 
              onClick={() => setShow(false)}
              className="absolute top-4 right-4 text-background/50 hover:text-background transition-colors"
            >
              <X size={16} />
            </button>
            
            <div className="space-y-4">
              <h3 className="font-serif text-lg tracking-wide">Privacy Notice</h3>
              <p className="font-sans text-xs text-background/70 leading-relaxed">
                We use cookies to enhance your experience and analyze our traffic. By continuing to use our site, you agree to our use of cookies and our <Link href="/privacy" className="underline underline-offset-2 hover:text-background transition-colors">Privacy Policy</Link>.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleAccept}
                  className="px-6 py-2 bg-background text-foreground font-sans text-[10px] tracking-widest uppercase hover:opacity-90 transition-opacity"
                >
                  Accept
                </button>
                <button
                  onClick={() => setShow(false)}
                  className="px-6 py-2 border border-background/20 font-sans text-[10px] tracking-widest uppercase hover:border-background/50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

"use client"

import { motion } from "framer-motion"

interface AudioWaveformProps {
  isRecording: boolean
}

export function AudioWaveform({ isRecording }: AudioWaveformProps) {
  // Generate organic wave bars
  const bars = Array.from({ length: 32 }, (_, i) => i)

  return (
    <div className="flex items-center justify-center gap-[3px] h-16 w-64">
      {bars.map((_, index) => {
        // Create organic-feeling random delays and durations
        const delay = (index * 0.05) % 0.5
        const baseDuration = 0.3 + (index % 5) * 0.1

        return (
          <motion.div
            key={index}
            className="w-1 rounded-full bg-white/90"
            initial={{ height: 4 }}
            animate={
              isRecording
                ? {
                    height: [4, 24 + Math.sin(index * 0.5) * 20, 8, 32 + Math.cos(index * 0.3) * 16, 4],
                    opacity: [0.6, 1, 0.8, 1, 0.6],
                  }
                : { height: 4, opacity: 0.4 }
            }
            transition={
              isRecording
                ? {
                    duration: baseDuration + Math.random() * 0.3,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    ease: "easeInOut",
                    delay: delay,
                  }
                : { duration: 0.3 }
            }
          />
        )
      })}
    </div>
  )
}

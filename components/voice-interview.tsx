"use client"

import { useState, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, X, ChevronRight, Loader2 } from "lucide-react"
import { AudioWaveform } from "./audio-waveform"
import type { Persona } from "./persona-card"
import { useMutation, useAction } from "convex/react"
import { api } from "@/convex/_generated/api"

const INTROSPECTION_QUESTIONS = [
  "What moment this week made you feel most alive?",
  "What truth have you been avoiding?",
  "When did you feel genuinely proud of yourself?",
  "What fear held you back from something you wanted?",
  "Who did you show up for, and who showed up for you?",
  "What would you tell your younger self about this week?",
  "Where did you find unexpected beauty?",
  "What pattern in your behavior became clearer?",
  "What conversation stayed with you long after it ended?",
  "If this week were a chapter, what would its title be?",
]

interface VoiceInterviewProps {
  persona: Persona
  sessionId: string
  onComplete: () => void
  onCancel: () => void
}

export function VoiceInterview({ persona, sessionId, onComplete, onCancel }: VoiceInterviewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const generateUploadUrl = useMutation(api.sessions.generateUploadUrl);
  const saveAudio = useMutation(api.sessions.saveAudio);
  const transcribeAudio = useAction(api.actions.transcribeAudio);
  const appendTranscript = useMutation(api.sessions.appendTranscript);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const currentQuestion = INTROSPECTION_QUESTIONS[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === INTROSPECTION_QUESTIONS.length - 1
  const progress = ((currentQuestionIndex + 1) / INTROSPECTION_QUESTIONS.length) * 100

  const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = async () => {
            const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
            await handleUpload(blob);
            // Cleanup stream
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        setHasAnswered(false);
    } catch (err) {
        console.error("Microphone access denied", err);
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
    }
  }

  const handleUpload = async (blob: Blob) => {
      setIsProcessing(true);
      try {
          const postUrl = await generateUploadUrl();
          
          const result = await fetch(postUrl, {
              method: "POST",
              headers: { "Content-Type": blob.type },
              body: blob,
          });
          
          if (!result.ok) throw new Error("Upload failed");
          
          const { storageId } = await result.json();
          
          // @ts-ignore
          const url = await saveAudio({ sessionId, storageId });
          
          if (url) {
              const text = await transcribeAudio({ audioUrl: url });
              const question = INTROSPECTION_QUESTIONS[currentQuestionIndex];
              // @ts-ignore
              await appendTranscript({ sessionId, text: `Q: ${question}\nA: ${text}` });
              setHasAnswered(true);
          }
      } catch (error) {
          console.error("Error processing audio", error);
      } finally {
          setIsProcessing(false);
      }
  }

  const handleMicPress = useCallback(() => {
    if (isProcessing) return;
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  }, [isRecording, isProcessing]);

  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      onComplete()
    } else {
      setCurrentQuestionIndex((prev) => prev + 1)
      setHasAnswered(false)
    }
  }, [isLastQuestion, onComplete])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/10">
        <motion.div
          className="h-full bg-white/60"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-6">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors duration-300"
        >
          <X className="w-5 h-5" />
          <span className="font-sans text-xs tracking-widest uppercase">Exit</span>
        </button>

        <div className="text-center">
          <span className="font-sans text-xs text-white/30 tracking-wider uppercase">Guided by {persona.name}</span>
        </div>

        <div className="flex items-center gap-2 text-white/40">
          <span className="font-sans text-xs tracking-wider">
            {currentQuestionIndex + 1} / {INTROSPECTION_QUESTIONS.length}
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 pb-48">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-2xl text-center"
          >
            <h1 className="font-serif text-2xl md:text-4xl lg:text-5xl text-white leading-relaxed tracking-tight text-balance">
              {currentQuestion}
            </h1>
          </motion.div>
        </AnimatePresence>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: isRecording ? 0 : 0.4 }}
          transition={{ duration: 0.3 }}
          className="mt-12 font-sans text-xs text-white tracking-wider uppercase"
        >
          {isProcessing ? "Transcribing..." : hasAnswered ? "Tap to re-record or continue" : "Hold to speak your truth"}
        </motion.p>
      </main>

      {/* Bottom action area */}
      <footer className="fixed bottom-0 left-0 right-0 flex flex-col items-center pb-12 md:pb-16">
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <AudioWaveform isRecording={isRecording} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-8">
          <motion.button
            onClick={handleMicPress}
            className="relative flex items-center justify-center"
            whileTap={{ scale: 0.95 }}
            disabled={isProcessing}
          >
            <AnimatePresence>
              {!isRecording && !isProcessing && (
                <>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: [0.3, 0.1, 0.3], scale: [1, 1.3, 1] }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                    className="absolute w-24 h-24 rounded-full border border-white/20"
                  />
                </>
              )}
            </AnimatePresence>

            <motion.div
              animate={{
                scale: isRecording ? 1.1 : 1,
                backgroundColor: isRecording ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.1)",
              }}
              transition={{ duration: 0.3 }}
              className="relative w-20 h-20 rounded-full flex items-center justify-center border border-white/30"
            >
              {isProcessing ? (
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
              ) : (
                <Mic
                  className={`w-8 h-8 transition-colors duration-300 ${isRecording ? "text-white" : "text-white/70"}`}
                />
              )}
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {hasAnswered && !isRecording && !isProcessing && (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-colors duration-300"
              >
                <span className="font-sans text-sm text-white tracking-wider">
                  {isLastQuestion ? "Complete" : "Next"}
                </span>
                <ChevronRight className="w-4 h-4 text-white" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-6 flex items-center gap-2"
            >
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                className="w-2 h-2 rounded-full bg-red-500"
              />
              <span className="font-sans text-xs text-white/50 tracking-wider uppercase">Listening...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </footer>
    </motion.div>
  )
}

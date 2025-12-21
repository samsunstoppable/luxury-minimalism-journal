"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation, useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { JournalHeader } from "@/components/journal-header"
import { JournalEntry } from "@/components/journal-entry"
import { DailyEntry } from "@/components/daily-entry"
import { EntryList } from "@/components/entry-list"
import { EmptyState } from "@/components/empty-state"
import { AnalysisUnlock } from "@/components/analysis-unlock"
import { VoiceInterview } from "@/components/voice-interview"
import { AnalysisChat } from "@/components/analysis-chat"
import type { Persona } from "@/components/persona-card"

export interface Entry {
  id: string
  title: string
  content: string
  date: Date
}

export default function JournalPage() {
  // Convex Hooks
  const rawEntries = useQuery(api.entries.list);
  const createEntry = useMutation(api.entries.create);
  const updateEntry = useMutation(api.entries.update);
  const deleteEntry = useMutation(api.entries.remove);
  
  // Session Hooks
  const createSession = useMutation(api.sessions.create);
  const analyzeSession = useAction(api.actions.analyzeSession);

  const entries: Entry[] = useMemo(() => {
    if (!rawEntries) return [];
    return rawEntries.map(e => ({
      id: e._id,
      title: e.title || "Untitled",
      content: e.content,
      date: new Date(e.date)
    }));
  }, [rawEntries]);

  const [isWriting, setIsWriting] = useState(false)
  const [isDailyMode, setIsDailyMode] = useState(true)
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [debugDays, setDebugDays] = useState(0); // For testing advancement
  
  const realCycleDay = entries.length;
  // Combine real entries + debug simulated days, capped at 7
  const cycleDay = Math.min(realCycleDay + debugDays, 7);

  const [isAnalysisMode, setIsAnalysisMode] = useState(false)
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [isChatMode, setIsChatMode] = useState(false)

  const handleNewEntry = () => {
    setSelectedEntry(null)
    setIsWriting(true)
    setIsDailyMode(true)
    setMenuOpen(false)
  }

  const handleSaveEntry = async (title: string, content: string) => {
    if (selectedEntry) {
      // @ts-ignore
      await updateEntry({ id: selectedEntry.id, title, content });
    } else {
      const today = new Date().toISOString().split('T')[0];
      await createEntry({
        title: title || "Untitled",
        content,
        date: today,
        dayNumber: (entries.length % 7) + 1
      });
    }
    setIsWriting(false)
    setSelectedEntry(null)
  }

  const handleSaveDailyEntry = async (content: string) => {
    const today = new Date()
    const dateStr = today.toISOString().split('T')[0];
    const title = today.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    
    await createEntry({
        title,
        content,
        date: dateStr,
        dayNumber: (entries.length % 7) + 1
    });
    setIsWriting(false);
  }

  const handleSelectEntry = (entry: Entry) => {
    setSelectedEntry(entry)
    setIsWriting(true)
    setIsDailyMode(false)
    setMenuOpen(false)
  }

  const handleDeleteEntry = async (id: string) => {
    // @ts-ignore
    await deleteEntry({ id });
    if (selectedEntry?.id === id) {
      setSelectedEntry(null)
      setIsWriting(false)
    }
  }

  const handleCancel = () => {
    setIsWriting(false)
    setSelectedEntry(null)
    setIsAnalysisMode(false)
    setIsVoiceMode(false)
    setIsChatMode(false)
  }

  const handleOpenAnalysis = () => {
    setIsAnalysisMode(true)
  }

  const handleSelectPersona = async (persona: Persona) => {
    try {
      setSelectedPersona(persona);
      const sid = await createSession({ personaId: persona.id });
      // @ts-ignore
      setSessionId(sid);
      
      setIsAnalysisMode(false);
      setIsVoiceMode(true);
      setIsChatMode(false);
    } catch (error) {
      console.error("Failed to start session:", error);
    }
  }

  const handleVoiceComplete = async () => {
    if (sessionId) {
        // Trigger analysis in background
        // @ts-ignore
        analyzeSession({ sessionId }).catch(console.error);
    }
    setIsVoiceMode(false)
    setIsChatMode(true)
  }

  const handleCloseChat = () => {
    setIsChatMode(false)
    setSelectedPersona(null)
    setSessionId(null)
  }

  if (isChatMode && selectedPersona && sessionId) {
    // @ts-ignore
    return <AnalysisChat persona={selectedPersona} sessionId={sessionId} onClose={handleCloseChat} />
  }

  if (isVoiceMode && selectedPersona && sessionId) {
    // @ts-ignore
    return <VoiceInterview persona={selectedPersona} sessionId={sessionId} onComplete={handleVoiceComplete} onCancel={handleCancel} />
  }

  if (isAnalysisMode) {
    return <AnalysisUnlock onSelectPersona={handleSelectPersona} onCancel={handleCancel} />
  }

  if (isWriting && isDailyMode && !selectedEntry) {
    return (
      <DailyEntry
        onSave={handleSaveDailyEntry}
        onCancel={handleCancel}
        cycleDay={cycleDay}
        cycleTotalDays={7}
        onAnalyze={handleOpenAnalysis}
        onDebugAdvance={() => setDebugDays(d => d + 1)}
      />
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <JournalHeader
        onNewEntry={() => {
          setSelectedEntry(null)
          setIsWriting(true)
          setIsDailyMode(true)
          setMenuOpen(false)
        }}
        onToggleMenu={() => setMenuOpen(!menuOpen)}
        menuOpen={menuOpen}
        hasEntries={entries.length > 0}
      />

      {/* Slide-in menu */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-foreground/5" onClick={() => setMenuOpen(false)} />
        <aside
          className={`absolute top-0 left-0 h-full w-80 max-w-[85vw] bg-card border-r border-border p-8 pt-24 transform transition-transform duration-300 ease-out ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <h2 className="font-serif text-xl text-foreground mb-8 tracking-wide">Your Entries</h2>
          {entries.length > 0 ? (
            <EntryList
              entries={entries}
              onSelect={handleSelectEntry}
              onDelete={handleDeleteEntry}
              selectedId={selectedEntry?.id}
            />
          ) : (
            <p className="text-muted-foreground text-sm leading-relaxed">
              No entries yet. Begin your journey by creating your first entry.
            </p>
          )}
        </aside>
      </div>

      {/* Main content area */}
      <div className="max-w-2xl mx-auto px-6 py-16 md:py-24">
        {isWriting ? (
          <JournalEntry entry={selectedEntry} onSave={handleSaveEntry} onCancel={handleCancel} />
        ) : entries.length === 0 ? (
          <EmptyState onNewEntry={handleNewEntry} />
        ) : (
          <div className="space-y-16">
            <div className="text-center space-y-4">
              <h1 className="font-serif text-3xl md:text-4xl text-foreground tracking-tight text-balance">
                Welcome Back
              </h1>
              <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
                You have {entries.length} {entries.length === 1 ? "entry" : "entries"} in your journal. Continue writing
                or revisit your past reflections.
              </p>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleNewEntry}
                className="font-sans text-sm tracking-widest uppercase text-foreground border-b border-foreground pb-1 hover:opacity-60 transition-opacity duration-300"
              >
                New Entry
              </button>
            </div>

            <div className="space-y-12">
              <h2 className="font-serif text-lg text-muted-foreground text-center">Recent</h2>
              {entries.slice(0, 3).map((entry) => (
                <article key={entry.id} onClick={() => handleSelectEntry(entry)} className="cursor-pointer group">
                  <div className="space-y-3 py-6 border-t border-border">
                    <time className="text-xs text-muted-foreground font-sans tracking-wider uppercase">
                      {entry.date.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                    <h3 className="font-serif text-xl md:text-2xl text-foreground group-hover:opacity-60 transition-opacity duration-300">
                      {entry.title}
                    </h3>
                    <p className="font-serif text-muted-foreground leading-relaxed line-clamp-2">{entry.content}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

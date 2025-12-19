"use client"

interface EmptyStateProps {
  onNewEntry: () => void
}

export function EmptyState({ onNewEntry }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-700">
      <div className="text-center space-y-8 max-w-md">
        {/* Decorative element */}
        <div className="flex justify-center">
          <div className="w-px h-16 bg-border" />
        </div>

        <h1 className="font-serif text-3xl md:text-4xl text-foreground tracking-tight text-balance leading-tight">
          A Space for Your Thoughts
        </h1>

        <p className="font-serif text-muted-foreground leading-relaxed text-pretty">
          Begin your journey of reflection. Each entry is a moment captured, a thought preserved, a story waiting to be
          told.
        </p>

        {/* Decorative element */}
        <div className="flex justify-center">
          <div className="w-12 h-px bg-border" />
        </div>

        <button
          onClick={onNewEntry}
          className="font-sans text-sm tracking-widest uppercase text-foreground border-b border-foreground pb-1 hover:opacity-60 transition-opacity duration-300"
        >
          Begin Writing
        </button>
      </div>
    </div>
  )
}

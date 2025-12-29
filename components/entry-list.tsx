"use client"

import { Trash2 } from "lucide-react"
import type { Entry } from "@/app/journal/page"
import type { Id } from "@/convex/_generated/dataModel"

interface EntryListProps {
  entries: Entry[]
  onSelect: (entry: Entry) => void
  onDelete: (id: Id<"entries">) => void
  selectedId?: Id<"entries">
}

export function EntryList({ entries, onSelect, onDelete, selectedId }: EntryListProps) {
  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className={`group flex items-start justify-between p-3 -mx-3 rounded-sm cursor-pointer transition-colors duration-200 ${
            selectedId === entry.id ? "bg-muted" : "hover:bg-muted/50"
          }`}
        >
          <div onClick={() => onSelect(entry)} className="flex-1 min-w-0 space-y-1">
            <h3 className="font-serif text-sm text-foreground truncate">{entry.title || "Untitled"}</h3>
            <time className="text-xs text-muted-foreground font-sans">
              {entry.date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(entry.id)
            }}
            className="p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all duration-200"
            aria-label="Delete entry"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}

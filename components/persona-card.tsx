"use client"

import { cn } from "@/lib/utils"

export interface Persona {
  id: string
  name: string
  subtitle: string
  imageQuery: string
  imageSrc?: string
}

interface PersonaCardProps {
  persona: Persona
  isSelected: boolean
  onSelect: (persona: Persona) => void
}

export function PersonaCard({ persona, isSelected, onSelect }: PersonaCardProps) {
  return (
    <button
      onClick={() => onSelect(persona)}
      className={cn(
        "group relative aspect-[3/4] w-full overflow-hidden bg-foreground transition-all duration-500 ease-out",
        isSelected
          ? "ring-2 ring-foreground ring-offset-4 ring-offset-background"
          : "hover:scale-[1.02] hover:shadow-xl",
      )}
    >
      {/* Portrait placeholder - high contrast B&W */}
      <div
        className={cn(
          "absolute inset-0 bg-cover bg-center transition-all duration-500",
          "group-hover:invert",
          isSelected && "invert",
        )}
        style={{
          backgroundImage: persona.imageSrc 
            ? `url('${persona.imageSrc}')`
            : `url('/placeholder-user.jpg')`,
          filter: "grayscale(100%) contrast(1.2)",
        }}
      />

      {/* Overlay gradient */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-foreground via-foreground/60 to-transparent transition-all duration-500",
          "group-hover:from-background group-hover:via-background/60",
          isSelected && "from-background via-background/60",
        )}
      />

      {/* Text content */}
      <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
        <h3
          className={cn(
            "font-serif text-lg md:text-xl text-background transition-colors duration-500",
            "group-hover:text-foreground",
            isSelected && "text-foreground",
          )}
        >
          {persona.name}
        </h3>
        <p
          className={cn(
            "font-sans text-xs tracking-wide text-background/70 mt-1 transition-colors duration-500",
            "group-hover:text-foreground/70",
            isSelected && "text-foreground/70",
          )}
        >
          {persona.subtitle}
        </p>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-foreground flex items-center justify-center">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-background"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      )}
    </button>
  )
}

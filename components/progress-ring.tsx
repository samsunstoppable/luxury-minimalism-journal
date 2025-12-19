"use client"

interface ProgressRingProps {
  currentDay: number
  totalDays: number
  size?: number
  strokeWidth?: number
}

export function ProgressRing({ currentDay, totalDays, size = 40, strokeWidth = 2 }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const progress = currentDay / totalDays
  const strokeDashoffset = circumference - progress * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-border"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="text-foreground transition-all duration-700 ease-out"
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-sans text-[10px] text-muted-foreground tracking-tight">
          {currentDay}/{totalDays}
        </span>
      </div>
    </div>
  )
}

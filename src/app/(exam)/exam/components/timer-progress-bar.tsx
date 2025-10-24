'use client'

import { useEffect, useMemo, useState } from 'react'

type TimerProgressBarProps = {
  startTime: string
  endTime: string
}

export const TimerProgressBar = ({
  startTime,
  endTime
}: TimerProgressBarProps) => {
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update current time more frequently for smoother animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 100)

    return () => clearInterval(interval)
  }, [])

  // NOTE: useMemo justified - calculations run every 100ms (10x per second)
  // Optimizing these calculations prevents unnecessary re-renders of child elements
  const { progressPercentage, colorClass, shouldBlink } = useMemo(() => {
    const start = new Date(startTime).getTime()
    const end = new Date(endTime).getTime()
    const current = currentTime.getTime()

    const totalDuration = end - start
    const timeRemaining = Math.max(0, end - current)

    // Calculate progress as percentage of time REMAINING (starts at 100%, goes to 0%)
    const remainingPercentage = Math.max(0, Math.min(100, (timeRemaining / totalDuration) * 100))

    let colorClass = 'bg-accent' // Default accent
    let shouldBlink = false

    if (remainingPercentage <= 10) {
      colorClass = 'bg-destructive'
      shouldBlink = true
    } else if (remainingPercentage <= 25) {
      colorClass = 'bg-primary'
      shouldBlink = false
    }

    return {
      progressPercentage: remainingPercentage,
      colorClass,
      shouldBlink
    }
  }, [startTime, endTime, currentTime])

  return (
    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
      <div
        className={`h-full transition-all duration-75 ease-linear progress-bar ${colorClass} ${shouldBlink ? 'animate-pulse' : ''
          }`}
        style={{ '--progress-width': `${progressPercentage}%` } as React.CSSProperties & { '--progress-width': string }}
      />
    </div>
  )
}

'use client'

import { Clock, CheckCircle2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

type AttemptStatusHeaderProps = {
  statusLabel: string
  timeRemainingLabel: string
}

export const AttemptStatusHeader = ({
  statusLabel,
  timeRemainingLabel
}: AttemptStatusHeaderProps) => {
  const isActive = statusLabel.includes('Active') || statusLabel.includes('Running')
  const isSubmitted = statusLabel.includes('submitted')
  
  return (
    <header className="mb-6 overflow-hidden rounded-xl border border-border/50 bg-gradient-to-r from-card to-card/50 p-6 shadow-lg backdrop-blur-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Time Remaining Section */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Time Remaining
            </p>
            <p className="text-2xl font-bold text-foreground sm:text-3xl">
              {timeRemainingLabel}
            </p>
          </div>
        </div>

        {/* Status Section */}
        <div className="flex items-center gap-3 sm:justify-end">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50">
            {isActive ? (
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            ) : isSubmitted ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            )}
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-muted-foreground">
              Status
            </p>
            <p className={cn(
              "text-base font-semibold",
              isActive && "text-green-600",
              isSubmitted && "text-green-600",
              !isActive && !isSubmitted && "text-amber-600"
            )}>
              {statusLabel}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}

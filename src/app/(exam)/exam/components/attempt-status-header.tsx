'use client'

type AttemptStatusHeaderProps = {
  statusLabel: string
  timeRemainingLabel: string
}

export const AttemptStatusHeader = ({
  statusLabel,
  timeRemainingLabel
}: AttemptStatusHeaderProps) => (
  <header className="mb-6 flex flex-col gap-4 rounded-lg border border-border bg-card px-6 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
    <div>
      <p className="text-sm font-medium text-muted-foreground">
        Time remaining
      </p>
      <p className="text-3xl font-semibold text-foreground">
        {timeRemainingLabel}
      </p>
    </div>
    <div className="text-right">
      <p className="text-sm font-medium text-muted-foreground">
        Attempt status
      </p>
      <p className="text-base font-semibold text-foreground">{statusLabel}</p>
    </div>
  </header>
)

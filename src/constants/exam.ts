// Exam-related constants

export const ACTIVE_STATUS_LABEL = 'Attempt in progress'

export const AUTO_SUBMIT_BUFFER_MS = 500

export const formatTimeRemaining = ({
  milliseconds
}: {
  milliseconds: number
}): string => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000))
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0')
  const seconds = (totalSeconds % 60).toString().padStart(2, '0')

  return `${minutes}:${seconds}`
}

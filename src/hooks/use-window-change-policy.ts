'use client'

import { useEffect, useRef } from 'react'

import type { TViolationType } from '@/types/exam'

export const useWindowChangePolicy = ({
  isActive,
  onViolation
}: {
  isActive: boolean
  onViolation?: (type: TViolationType) => void
}): void => {
  const lastEventTimestampRef = useRef(0)

  useEffect(() => {
    if (!isActive) {
      return
    }

    const notify = (type: TViolationType) => {
      if (!onViolation) {
        return
      }

      const now = Date.now()
      if (now - lastEventTimestampRef.current < 400) {
        return
      }

      lastEventTimestampRef.current = now
      onViolation(type)
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        notify('window-blur')
      }
    }

    const handleWindowBlur = () => {
      notify('window-blur')
    }

    const handleWindowFocus = () => {
      // Only track focus changes that indicate tab switching
      if (document.visibilityState === 'visible') {
        notify('window-focus-change')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleWindowBlur)
    window.addEventListener('focus', handleWindowFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleWindowBlur)
      window.removeEventListener('focus', handleWindowFocus)
    }
  }, [isActive, onViolation])
}

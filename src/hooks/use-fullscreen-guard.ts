'use client'

import { useCallback, useEffect } from 'react'

export const useFullscreenGuard = ({
  isActive,
  onFullscreenExit
}: {
  isActive: boolean
  onFullscreenExit?: () => void
}): {
  requestFullscreen: () => Promise<void>
} => {
  const requestFullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      return
    }

    try {
      await document.documentElement.requestFullscreen()
    } catch (error) {
      console.error('Failed to enter fullscreen mode', error)
    }
  }, [])

  useEffect(() => {
    if (!isActive) {
      return
    }

    const handleChange = () => {
      console.log('[FULLSCREEN] Change event - isFullscreen:', !!document.fullscreenElement)
      if (!document.fullscreenElement) {
        console.log('[FULLSCREEN] User exited fullscreen - calling violation handler')
        // Call the violation handler FIRST before re-entering fullscreen
        onFullscreenExit?.()
        console.log('[FULLSCREEN] Re-entering fullscreen')
        // Then automatically re-enter fullscreen
        void requestFullscreen()
      }
    }

    document.addEventListener('fullscreenchange', handleChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleChange)
    }
  }, [isActive, requestFullscreen, onFullscreenExit])

  return {
    requestFullscreen
  }
}

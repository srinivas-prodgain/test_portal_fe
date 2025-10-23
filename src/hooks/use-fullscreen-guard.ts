'use client'

import { useCallback, useEffect } from 'react'

export const useFullscreenGuard = ({
  isActive
}: {
  isActive: boolean
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
      if (!document.fullscreenElement) {
        // Automatically re-enter fullscreen when user exits
        void requestFullscreen()
      }
    }

    document.addEventListener('fullscreenchange', handleChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleChange)
    }
  }, [isActive, requestFullscreen])

  return {
    requestFullscreen
  }
}

'use client'

import { useEffect } from 'react'

export const useDisableCopyPaste = ({
  isActive
}: {
  isActive: boolean
}): void => {
  useEffect(() => {
    if (!isActive) {
      return
    }

    const handleClipboard = (event: ClipboardEvent) => {
      // Simply prevent copy/paste without tracking violations
      event.preventDefault()
    }

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault()
    }

    document.addEventListener('copy', handleClipboard)
    document.addEventListener('cut', handleClipboard)
    document.addEventListener('paste', handleClipboard)
    document.addEventListener('contextmenu', handleContextMenu)

    return () => {
      document.removeEventListener('copy', handleClipboard)
      document.removeEventListener('cut', handleClipboard)
      document.removeEventListener('paste', handleClipboard)
      document.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [isActive])
}

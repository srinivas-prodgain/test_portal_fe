'use client'

import { useEffect } from 'react'

export const useDisableCopyPaste = ({
  is_active
}: {
  is_active: boolean
}): void => {
  useEffect(() => {
    if (!is_active) {
      return
    }

    const handle_clipboard = (event: ClipboardEvent) => {
      // Simply prevent copy/paste without tracking violations
      event.preventDefault()
    }

    const handle_context_menu = (event: MouseEvent) => {
      event.preventDefault()
    }

    document.addEventListener('copy', handle_clipboard)
    document.addEventListener('cut', handle_clipboard)
    document.addEventListener('paste', handle_clipboard)
    document.addEventListener('contextmenu', handle_context_menu)

    return () => {
      document.removeEventListener('copy', handle_clipboard)
      document.removeEventListener('cut', handle_clipboard)
      document.removeEventListener('paste', handle_clipboard)
      document.removeEventListener('contextmenu', handle_context_menu)
    }
  }, [is_active])
}

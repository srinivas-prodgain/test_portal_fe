'use client'

import { useEffect } from 'react'

export const useDevtoolsGuard = ({ isActive }: { isActive: boolean }): void => {
  useEffect(() => {
    if (!isActive) {
      return
    }

    // Block all common dev tools keyboard shortcuts
    const handleKeydown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()

      // Block F12
      if (event.key === 'F12' || event.key === 'f12') {
        event.preventDefault()
        event.stopPropagation()
        return false
      }

      // Block Ctrl+Shift+I (Inspector)
      if (event.ctrlKey && event.shiftKey && key === 'i') {
        event.preventDefault()
        event.stopPropagation()
        return false
      }

      // Block Ctrl+Shift+J (Console)
      if (event.ctrlKey && event.shiftKey && key === 'j') {
        event.preventDefault()
        event.stopPropagation()
        return false
      }

      // Block Ctrl+Shift+C (Element selector)
      if (event.ctrlKey && event.shiftKey && key === 'c') {
        event.preventDefault()
        event.stopPropagation()
        return false
      }

      // Block Ctrl+U (View source)
      if (event.ctrlKey && key === 'u') {
        event.preventDefault()
        event.stopPropagation()
        return false
      }

      // Block ctrl+R
      if (event.ctrlKey && key === 'r') {
        event.preventDefault()
        event.stopPropagation()
        return false
      }

      // Block ctrl+F
      if (event.ctrlKey && key === 'f') {
        event.preventDefault()
        event.stopPropagation()
        return false
      }

      // Block Ctrl+Shift+K (Firefox console)
      if (event.ctrlKey && event.shiftKey && key === 'k') {
        event.preventDefault()
        event.stopPropagation()
        return false
      }

      // Block Cmd+Option+I (Mac Inspector)
      if (event.metaKey && event.altKey && key === 'i') {
        event.preventDefault()
        event.stopPropagation()
        return false
      }

      // BLock cmd+R
      if (event.metaKey && key === 'r') {
        event.preventDefault()
        event.stopPropagation()
        return false
      }

      // Block cmd+F
      if (event.metaKey && key === 'f') {
        event.preventDefault()
        event.stopPropagation()
        return false
      }

      // Block Cmd+Option+J (Mac Console)
      if (event.metaKey && event.altKey && key === 'j') {
        event.preventDefault()
        event.stopPropagation()
        return false
      }

      // Block Cmd+Option+C (Mac Element selector)
      if (event.metaKey && event.altKey && key === 'c') {
        event.preventDefault()
        event.stopPropagation()
        return false
      }
    }

    // Block right-click context menu
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
      return false
    }

    // Block text selection (prevents some inspection methods)
    const handleSelectStart = (event: Event) => {
      event.preventDefault()
      return false
    }

    // Block drag and drop (prevents some inspection methods)
    const handleDragStart = (event: DragEvent) => {
      event.preventDefault()
      return false
    }

    // Add event listeners with capture to catch events early
    document.addEventListener('keydown', handleKeydown, { capture: true })
    document.addEventListener('contextmenu', handleContextMenu, {
      capture: true
    })
    document.addEventListener('selectstart', handleSelectStart, {
      capture: true
    })
    document.addEventListener('dragstart', handleDragStart, { capture: true })

    // Disable common dev tools detection methods
    const disableConsole = () => {
      // Override console methods to prevent usage
      const noop = () => {}
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(window as any).console = {
          log: noop,
          error: noop,
          warn: noop,
          info: noop,
          debug: noop,
          trace: noop,
          dir: noop,
          dirxml: noop,
          table: noop,
          clear: noop,
          count: noop,
          time: noop,
          timeEnd: noop,
          group: noop,
          groupEnd: noop,
          groupCollapsed: noop
        }
      }
    }

    disableConsole()

    return () => {
      document.removeEventListener('keydown', handleKeydown, { capture: true })
      document.removeEventListener('contextmenu', handleContextMenu, {
        capture: true
      })
      document.removeEventListener('selectstart', handleSelectStart, {
        capture: true
      })
      document.removeEventListener('dragstart', handleDragStart, {
        capture: true
      })
    }
  }, [isActive])
}

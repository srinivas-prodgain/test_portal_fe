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
      const code = event.code

      // Block F12
      if (event.key === 'F12' || event.key === 'f12' || code === 'F12') {
        event.preventDefault()
        event.stopPropagation()
        return false
      }

      // Block Ctrl+Shift+I (Inspector)
      if (event.ctrlKey && event.shiftKey && (key === 'i' || code === 'KeyI')) {
        event.preventDefault()
        event.stopPropagation()
        return false
      }

      // Block Ctrl+Shift+J (Console)
      if (event.ctrlKey && event.shiftKey && (key === 'j' || code === 'KeyJ')) {
        event.preventDefault()
        event.stopPropagation()
        return false
      }

      // Block Ctrl+Shift+C (Element selector)
      if (event.ctrlKey && event.shiftKey && (key === 'c' || code === 'KeyC')) {
        event.preventDefault()
        event.stopPropagation()
        return false
      }

      // Block Ctrl+U (View source)
      if (event.ctrlKey && (key === 'u' || code === 'KeyU')) {
        event.preventDefault()
        event.stopPropagation()
        return false
      }

      // Block ctrl+R
      if (event.ctrlKey && (key === 'r' || code === 'KeyR')) {
        event.preventDefault()
        event.stopPropagation()
        return false
      }

      // Block ctrl+F
      if (event.ctrlKey && (key === 'f' || code === 'KeyF')) {
        event.preventDefault()
        event.stopPropagation()
        return false
      }

      // Block Ctrl+Shift+K (Firefox console)
      if (event.ctrlKey && event.shiftKey && (key === 'k' || code === 'KeyK')) {
        event.preventDefault()
        event.stopPropagation()
        return false
      }

      // Block Cmd+Option+I (Mac Inspector) - Enhanced detection
      if (event.metaKey && event.altKey && (key === 'i' || code === 'KeyI')) {
        event.preventDefault()
        event.stopPropagation()
        return false
      }

      // Block Cmd+Option+J (Mac Console) - Enhanced detection
      if (event.metaKey && event.altKey && (key === 'j' || code === 'KeyJ')) {
        event.preventDefault()
        event.stopPropagation()
        return false
      }

      // Block Cmd+Option+C (Mac Element selector) - Enhanced detection
      if (event.metaKey && event.altKey && (key === 'c' || code === 'KeyC')) {
        event.preventDefault()
        event.stopPropagation()
        return false
      }

      // Block Cmd+Option+K (Mac Console alternative)
      if (event.metaKey && event.altKey && (key === 'k' || code === 'KeyK')) {
        event.preventDefault()
        event.stopPropagation()
        return false
      }

      // Block cmd+R
      if (event.metaKey && (key === 'r' || code === 'KeyR')) {
        event.preventDefault()
        event.stopPropagation()
        return false
      }

      // Block cmd+F
      if (event.metaKey && (key === 'f' || code === 'KeyF')) {
        event.preventDefault()
        event.stopPropagation()
        return false
      }

      // Block Cmd+Shift+I (Alternative Mac Inspector)
      if (event.metaKey && event.shiftKey && (key === 'i' || code === 'KeyI')) {
        event.preventDefault()
        event.stopPropagation()
        return false
      }

      // Block Cmd+Shift+J (Alternative Mac Console)
      if (event.metaKey && event.shiftKey && (key === 'j' || code === 'KeyJ')) {
        event.preventDefault()
        event.stopPropagation()
        return false
      }

      // Block Cmd+Shift+C (Alternative Mac Element selector)
      if (event.metaKey && event.shiftKey && (key === 'c' || code === 'KeyC')) {
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
    document.addEventListener('keydown', handleKeydown, { capture: true, passive: false })
    document.addEventListener('contextmenu', handleContextMenu, {
      capture: true,
      passive: false
    })
    document.addEventListener('selectstart', handleSelectStart, {
      capture: true,
      passive: false
    })
    document.addEventListener('dragstart', handleDragStart, { capture: true, passive: false })

    // Additional security measures
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
      return ''
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User might be switching to dev tools
        console.clear()
      }
    }

    // Block common dev tools detection methods
    const blockDevToolsDetection = () => {
      // Override toString methods to prevent detection
      const originalToString = Function.prototype.toString
      Function.prototype.toString = function () {
        if (this === blockDevToolsDetection) {
          return 'function blockDevToolsDetection() { [native code] }'
        }
        return originalToString.call(this)
      }

      // Block common dev tools detection techniques
      const devtools = { open: false, orientation: null }
      const threshold = 160

      const detectDevTools = () => {
        if (window.outerHeight - window.innerHeight > threshold ||
          window.outerWidth - window.innerWidth > threshold) {
          if (!devtools.open) {
            devtools.open = true
            console.clear()
            // You could trigger a violation here if needed
          }
        } else {
          devtools.open = false
        }
      }

      setInterval(detectDevTools, 500)
    }

    document.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    blockDevToolsDetection()

    // Disable common dev tools detection methods
    const disableConsole = () => {
      // Override console methods to prevent usage
      const noop = () => { }
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ; (window as any).console = {
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
      document.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isActive])
}

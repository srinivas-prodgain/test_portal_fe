import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import type { TAttemptStatus, TViolationType } from '@/types/exam'

type TUseExamSecurityListenersParams = {
    isActive: boolean
    onViolation: (type: TViolationType) => Promise<void>
    onTerminate: () => void
}

export const useExamSecurityListeners = ({
    isActive,
    onViolation,
    onTerminate
}: TUseExamSecurityListenersParams) => {
    const router = useRouter()

    useEffect(() => {
        if (!isActive) return

        const handlers = {
            visibilitychange: () => document.hidden && void onViolation('window-blur'),
            blur: () => void onViolation('window-blur'),
            copy: (e: Event) => e.preventDefault(),
            paste: (e: Event) => e.preventDefault(),
            contextmenu: (e: Event) => e.preventDefault()
        }

        document.addEventListener('visibilitychange', handlers.visibilitychange)
        window.addEventListener('blur', handlers.blur)
        document.addEventListener('copy', handlers.copy)
        document.addEventListener('paste', handlers.paste)
        document.addEventListener('contextmenu', handlers.contextmenu)

        return () => {
            document.removeEventListener('visibilitychange', handlers.visibilitychange)
            window.removeEventListener('blur', handlers.blur)
            document.removeEventListener('copy', handlers.copy)
            document.removeEventListener('paste', handlers.paste)
            document.removeEventListener('contextmenu', handlers.contextmenu)
        }
    }, [isActive, onViolation])

    useEffect(() => {
        if (!isActive) return

        const exitMessage =
            'Refreshing or closing this tab will terminate your exam attempt. Do you want to exit?'

        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault()
            event.returnValue = exitMessage
        }

        const handleRefreshShortcuts = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase()

            if (event.key === 'Escape') {
                event.preventDefault()
                return
            }

            const isRefreshKey =
                event.key === 'F5' || (key === 'r' && (event.metaKey || event.ctrlKey))
            if (!isRefreshKey) return

            event.preventDefault()
            const shouldExit = window.confirm(
                'Do you want to exit the exam? This action will terminate your attempt.'
            )

            if (shouldExit) {
                onTerminate()
                router.replace('/submit?status=terminated')
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        window.addEventListener('keydown', handleRefreshShortcuts)

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
            window.removeEventListener('keydown', handleRefreshShortcuts)
        }
    }, [isActive, onTerminate, router])
}


'use client'

import type { Dispatch, SetStateAction } from 'react'
import { AlertTriangle } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { MAX_WARNINGS_ALLOWED } from '@/constants/exam'

type ViolationWarningDialogProps = {
  open: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>
  onAcknowledge: () => Promise<void>
  violationCount: number
}

export const ViolationWarningDialog = ({
  open,
  onOpenChange,
  onAcknowledge,
  violationCount
}: ViolationWarningDialogProps) => {
  const handleAcknowledge = () => {
    void onAcknowledge()
  }

  const remainingWarnings = MAX_WARNINGS_ALLOWED - violationCount

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl shadow-2xl">
        <AlertDialogHeader className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-500/10 ring-1 ring-orange-500/20">
              <AlertTriangle className="h-6 w-6 text-orange-400" />
            </div>

            <div className="flex-1 space-y-1">
              <AlertDialogTitle className="text-lg font-medium text-white">
                Focus Required
              </AlertDialogTitle>
              <div className="text-xs font-medium uppercase tracking-wider text-orange-400/80">
                Warning {violationCount} of {MAX_WARNINGS_ALLOWED}
              </div>
            </div>
          </div>

          <AlertDialogDescription className="space-y-4 text-left text-sm leading-relaxed text-white/70">
            <p className="text-base text-white/90">
              We detected activity that breaks the assessment rules. You have{' '}
              <span className="font-medium text-white">{remainingWarnings} warning{remainingWarnings !== 1 ? 's' : ''} remaining</span>
              —any further violations will end the exam immediately.
            </p>

            <div className="space-y-3">
              <p className="text-sm font-medium text-white/90">
                Please avoid the following:
              </p>
              <div className="space-y-2 rounded-lg border border-white/5 bg-white/[0.02] p-4 text-left">
                <div className="flex items-center gap-3 text-sm text-white/80">
                  <div className="h-1.5 w-1.5 rounded-full bg-white/40" />
                  <span>Leaving fullscreen or switching tabs/windows</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-white/80">
                  <div className="h-1.5 w-1.5 rounded-full bg-white/40" />
                  <span>Opening developer tools or inspector panes</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 px-4 py-3">
              <p className="text-sm text-blue-200">
                Stay focused in fullscreen mode to continue safely
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-6">
          <AlertDialogAction
            onClick={handleAcknowledge}
            className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-transparent"
          >
            I Understand
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

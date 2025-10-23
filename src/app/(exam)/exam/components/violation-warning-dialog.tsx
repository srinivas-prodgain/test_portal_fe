'use client'

import { useCallback } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { AlertTriangle, ShieldCheck } from 'lucide-react'

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
  const handleAcknowledge = useCallback(() => {
    void onAcknowledge()
  }, [onAcknowledge])

  const remainingWarnings = MAX_WARNINGS_ALLOWED - violationCount

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md rounded-3xl border border-slate-100 bg-white shadow-xl">
        <AlertDialogHeader className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg bg-amber-50 px-3 py-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wide">
              Focus Required
            </span>
          </div>
          <AlertDialogTitle className="text-xl font-semibold text-slate-900">
            You&apos;re Outside Exam Guidelines
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4 text-left text-sm leading-relaxed text-slate-600">
            <p>
              We detected activity that breaks the assessment rules. This is warning {violationCount} of {MAX_WARNINGS_ALLOWED}. 
              You have {remainingWarnings} warning{remainingWarnings !== 1 ? 's' : ''} remaining—any further violations after 
              your final warning will end the exam immediately.
            </p>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700">
                Avoid the following before continuing:
              </p>
              <ul className="space-y-1.5 rounded-lg bg-slate-50 px-4 py-3 text-sm">
                <li>• Leaving fullscreen or switching tabs/windows</li>
                <li>• Opening developer tools or inspector panes</li>
              </ul>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-sm font-medium">
                Stay focused in fullscreen mode to continue safely.
              </span>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={handleAcknowledge}
            className="w-full justify-center rounded-full bg-violet-600 text-sm font-semibold text-white hover:bg-violet-700"
          >
            I Understand
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

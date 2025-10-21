'use client'

import { useCallback } from 'react'
import type { Dispatch, SetStateAction } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'

type ViolationWarningDialogProps = {
  open: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>
  onAcknowledge: () => Promise<void>
}

export const ViolationWarningDialog = ({
  open,
  onOpenChange,
  onAcknowledge
}: ViolationWarningDialogProps) => {
  const handleAcknowledge = useCallback(() => {
    void onAcknowledge()
  }, [onAcknowledge])

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>⚠️ Violation Warning</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p className="font-semibold text-destructive">
              You have violated the exam rules!
            </p>
            <p>This is your first and only warning. Violations include:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Switching tabs or windows</li>
              <li>Exiting fullscreen mode</li>
              <li>Attempting to copy or paste</li>
              <li>Opening developer tools</li>
            </ul>
            <p className="mt-4 font-semibold">
              If you commit another violation, your exam will be automatically
              terminated.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleAcknowledge}>
            I Understand
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

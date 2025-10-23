'use client'

import { CheckCircle2, AlertTriangle } from 'lucide-react'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog'

type SubmitConfirmationDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => Promise<void>
    isSubmitPending: boolean
}

export const SubmitConfirmationDialog = ({
    open,
    onOpenChange,
    onConfirm,
    isSubmitPending
}: SubmitConfirmationDialogProps) => {
    const handleConfirm = async () => {
        await onConfirm()
        onOpenChange(false)
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-md">
                <AlertDialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                            <AlertTriangle className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                            <AlertDialogTitle className="text-lg font-semibold text-gray-900">
                                Submit Assessment
                            </AlertDialogTitle>
                        </div>
                    </div>
                </AlertDialogHeader>

                <AlertDialogDescription className="text-sm text-gray-600 leading-relaxed">
                    Are you sure you want to submit your assessment? Once submitted, you will not be able to make any changes to your answers.
                </AlertDialogDescription>

                <AlertDialogFooter className="gap-2 sm:gap-3">
                    <AlertDialogCancel
                        disabled={isSubmitPending}
                        className="h-10 px-4 text-sm font-medium"
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={isSubmitPending}
                        className="h-10 gap-2 bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isSubmitPending ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-4 w-4" />
                                Yes, Submit
                            </>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

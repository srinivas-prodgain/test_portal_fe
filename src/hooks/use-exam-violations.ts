import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'

import type { TAttemptResponse, TAttemptStatus, TViolationType, TQuestion } from '@/types/exam'
import { useRegisterEvent } from '@/hooks/api'

type TUseExamViolationsParams = {
    attemptInfo: TAttemptResponse | null
    attemptStatus: TAttemptStatus
    isAttemptActive: boolean
    questions: TQuestion[]
    currentQuestionIndex: number
    currentAnswer: string
    answersCache: Record<string, string>
    onAttemptUpdate: (violationCount: number) => void
    onAttemptTerminated: () => void
}

type TViolationHandlerRefs = {
    attemptInfo: TAttemptResponse | null
    attemptStatus: TAttemptStatus
    currentQuestionIndex: number
    currentAnswer: string
    answersCache: Record<string, string>
}

export const useExamViolations = ({
    attemptInfo,
    attemptStatus,
    isAttemptActive,
    questions,
    currentQuestionIndex,
    currentAnswer,
    answersCache,
    onAttemptUpdate,
    onAttemptTerminated
}: TUseExamViolationsParams) => {
    const router = useRouter()
    const { mutateAsync: registerEvent } = useRegisterEvent()
    const [isProcessingViolation, setIsProcessingViolation] = useState(false)
    const [showWarningDialog, setShowWarningDialog] = useState(false)

    const prepareAnswersForSubmission = (
        questionIndex: number,
        answer: string,
        cache: Record<string, string>
    ) => {
        const currentQ = questions[questionIndex]
        const allAnswers = { ...cache }

        if (currentQ && answer.trim()) {
            allAnswers[currentQ.questionId] = answer
        }

        return Object.entries(allAnswers)
            .filter(([, ans]) => ans.trim())
            .map(([questionId, ans]) => ({
                questionId,
                answers: ans
            }))
    }

    const handleViolation = useCallback(
        async (type: TViolationType, refs: TViolationHandlerRefs): Promise<void> => {
            const canProcessViolation =
                refs.attemptInfo?.attemptId &&
                refs.attemptStatus === 'running' &&
                !isProcessingViolation

            if (!canProcessViolation || !refs.attemptInfo) {
                return
            }

            setIsProcessingViolation(true)

            try {
                const answersToSend = prepareAnswersForSubmission(
                    refs.currentQuestionIndex,
                    refs.currentAnswer,
                    refs.answersCache
                )

                const response = await registerEvent({
                    attemptId: refs.attemptInfo.attemptId,
                    type,
                    answers: answersToSend
                })

                onAttemptUpdate(response.violationCount)

                if (response.action === 'warn') {
                    setShowWarningDialog(true)
                } else if (response.action === 'terminate') {
                    onAttemptTerminated()
                    router.replace('/submit?status=terminated')
                }
            } finally {
                setTimeout(() => setIsProcessingViolation(false), 1000)
            }
        },
        [isProcessingViolation, registerEvent, onAttemptUpdate, onAttemptTerminated, router, questions]
    )

    return {
        isProcessingViolation,
        showWarningDialog,
        setShowWarningDialog,
        handleViolation
    }
}


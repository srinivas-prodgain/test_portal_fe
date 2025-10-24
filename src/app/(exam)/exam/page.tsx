'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import type { TAttemptResponse, TAttemptStatus, TViolationType } from '@/types/exam'
import {
  useGetAttempt,
  useGetQuestions,
  useSubmitAttempt
} from '@/hooks/api'
import { useDevtoolsGuard } from '@/hooks/use-devtools-guard'
import { useDisableCopyPaste } from '@/hooks/use-disable-copy-paste'
import { useFullscreenGuard } from '@/hooks/use-fullscreen-guard'
import { useExamTimer } from '@/hooks/use-exam-timer'
import { useExamViolations } from '@/hooks/use-exam-violations'
import { useExamSecurityListeners } from '@/hooks/use-exam-security-listeners'
import { useExamAnswers } from '@/hooks/use-exam-answers'

import {
  AttemptErrorState,
  ExamLayout,
  ExamLoadingState,
  MissingCandidateNotice,
  SubmitConfirmationDialog
} from './components'

export const ExamPageContent = () => {
  const router = useRouter()
  const candidateId = useSearchParams().get('candidate_id')

  const attemptQuery = useGetAttempt(
    { candidateId: candidateId ?? '' },
    { enabled: Boolean(candidateId) }
  )
  const questionsQuery = useGetQuestions({ enabled: Boolean(candidateId) })
  const { mutateAsync: submitAttempt, isPending: isSubmitPending } = useSubmitAttempt()

  const [attemptInfo, setAttempt] = useState<TAttemptResponse | null>(null)
  const [attemptStatus, setAttemptStatus] = useState<TAttemptStatus>('running')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)

  const questions = questionsQuery.data ?? []
  const isAttemptActive = attemptStatus === 'running'
  const currentQuestion = questions[currentQuestionIndex]

  const { answersCache, setAnswersCache, currentAnswer, setCurrentAnswer } = useExamAnswers({
    attemptInfo,
    currentQuestion
  })

  const stateRefs = useRef({
    attemptInfo,
    attemptStatus,
    currentQuestionIndex,
    currentAnswer,
    answersCache
  })

  useEffect(() => {
    stateRefs.current = {
      attemptInfo,
      attemptStatus,
      currentQuestionIndex,
      currentAnswer,
      answersCache
    }
  }, [attemptInfo, attemptStatus, currentQuestionIndex, currentAnswer, answersCache])

  const prepareAnswersForSubmission = useCallback(() => {
    const { currentQuestionIndex, currentAnswer, answersCache } = stateRefs.current
    const currentQ = questions[currentQuestionIndex]
    const allAnswers = { ...answersCache }

    if (currentQ && currentAnswer.trim()) {
      allAnswers[currentQ.questionId] = currentAnswer
    }

    return Object.entries(allAnswers)
      .filter(([, answer]) => answer.trim())
      .map(([questionId, answer]) => ({
        questionId,
        answers: answer
      }))
  }, [questions])

  const handleSubmitAttempt = useCallback(
    async (isAutoSubmit = false): Promise<void> => {
      const { attemptInfo, attemptStatus } = stateRefs.current
      const attemptId = attemptInfo?.attemptId

      const canSubmit = attemptId && attemptStatus === 'running' && !isSubmitPending

      if (!canSubmit) {
        return
      }

      const answersToSubmit = prepareAnswersForSubmission()
      const finalStatus = isAutoSubmit ? 'auto_submitted' : 'submitted'

      await submitAttempt({ attemptId, answers: answersToSubmit, isAutoSubmit })
      setAttemptStatus(finalStatus)
      router.replace(`/submit?status=${finalStatus}`)
    },
    [isSubmitPending, prepareAnswersForSubmission, submitAttempt, router]
  )

  const handleAttemptTerminated = useCallback(() => {
    setAttemptStatus('terminated')
  }, [])

  const handleViolationUpdate = useCallback((violationCount: number) => {
    setAttempt((prev) => (prev ? { ...prev, violationCount } : prev))
  }, [])

  const {
    isProcessingViolation,
    showWarningDialog,
    setShowWarningDialog,
    handleViolation
  } = useExamViolations({
    attemptInfo,
    attemptStatus,
    isAttemptActive,
    questions,
    currentQuestionIndex,
    currentAnswer,
    answersCache,
    onAttemptUpdate: handleViolationUpdate,
    onAttemptTerminated: handleAttemptTerminated
  })

  const handleFullscreenViolation = useCallback(() => {
    void handleViolation('fullscreen', stateRefs.current)
  }, [handleViolation])

  const timeRemainingLabel = useExamTimer({
    endsAt: attemptInfo?.endsAt,
    isActive: isAttemptActive,
    onTimeExpired: async () => {
      await handleSubmitAttempt(true)
    }
  })

  useDisableCopyPaste({ isActive: isAttemptActive })
  useDevtoolsGuard({ isActive: isAttemptActive })
  const { requestFullscreen } = useFullscreenGuard({
    isActive: isAttemptActive,
    onFullscreenExit: handleFullscreenViolation
  })

  const handleViolationEvent = useCallback(
    async (type: TViolationType) => {
      await handleViolation(type, stateRefs.current)
    },
    [handleViolation]
  )

  useExamSecurityListeners({
    isActive: isAttemptActive,
    onViolation: handleViolationEvent,
    onTerminate: handleAttemptTerminated
  })

  useEffect(() => {
    const shouldEnterFullscreen = attemptInfo && isAttemptActive && !document.fullscreenElement

    if (shouldEnterFullscreen) {
      void document.documentElement.requestFullscreen().catch(() => {
        // Fullscreen request failed silently
      })
    }
  }, [attemptInfo, isAttemptActive])

  const handleWarningAcknowledge = useCallback(async (): Promise<void> => {
    setShowWarningDialog(false)
    await requestFullscreen()
  }, [requestFullscreen, setShowWarningDialog])

  useEffect(() => {
    const existingAttempt = attemptQuery.data
    if (!existingAttempt) return

    setAttempt(existingAttempt)

    const shouldUpdateStatus =
      existingAttempt.status === 'running'
        ? stateRefs.current.attemptStatus !== 'running'
        : stateRefs.current.attemptStatus !== existingAttempt.status

    if (shouldUpdateStatus) {
      const status = existingAttempt.status as TAttemptStatus
      setAttemptStatus(status)

      if (existingAttempt.status !== 'running') {
        router.replace(`/submit?status=${status}`)
      }
    }
  }, [attemptQuery.data, router])

  const handleAnswerChange = useCallback(
    (value: string): void => {
      const canChangeAnswer = isAttemptActive && currentQuestion && attemptInfo

      if (!canChangeAnswer) return

      setCurrentAnswer(value)
      setAnswersCache((prev) => ({
        ...prev,
        [currentQuestion.questionId]: value
      }))
    },
    [isAttemptActive, currentQuestion, attemptInfo, setCurrentAnswer, setAnswersCache]
  )

  const handleMove = useCallback(
    async (direction: 'next' | 'previous'): Promise<void> => {
      const canMove = currentQuestion && isAttemptActive && attemptInfo

      if (!canMove) return

      setCurrentQuestionIndex((prev) =>
        direction === 'next'
          ? Math.min(prev + 1, Math.max(questions.length - 1, 0))
          : Math.max(prev - 1, 0)
      )
    },
    [currentQuestion, isAttemptActive, attemptInfo, questions.length]
  )

  const handleFinishAttemptClick = useCallback(async (): Promise<void> => {
    const canFinish = isAttemptActive && attemptInfo

    if (!canFinish) return

    setShowSubmitDialog(true)
  }, [isAttemptActive, attemptInfo])

  const handleSubmitConfirmation = useCallback(async (): Promise<void> => {
    await handleSubmitAttempt()
  }, [handleSubmitAttempt])

  if (!candidateId) {
    return <MissingCandidateNotice onNavigate={() => router.push('/form1')} />
  }

  const isLoadingData = attemptQuery.isLoading || questionsQuery.isLoading
  const hasError = attemptQuery.isError || questionsQuery.isError

  if (isLoadingData) {
    return <ExamLoadingState />
  }

  if (hasError) {
    return <AttemptErrorState message="Failed to load exam. Please refresh the page." />
  }

  return (
    <>
      <ExamLayout
        timeRemainingLabel={timeRemainingLabel}
        currentQuestionIndex={currentQuestionIndex}
        questionsCount={questions.length}
        currentQuestion={currentQuestion}
        currentAnswer={currentAnswer}
        isAttemptActive={isAttemptActive}
        isSubmitPending={isSubmitPending}
        attemptStartTime={attemptInfo?.startAt}
        attemptEndTime={attemptInfo?.endsAt}
        onAnswerChange={handleAnswerChange}
        onMove={handleMove}
        onFinish={handleFinishAttemptClick}
        showWarningDialog={showWarningDialog}
        onWarningDialogChange={setShowWarningDialog}
        onWarningAcknowledge={handleWarningAcknowledge}
        violationCount={attemptInfo?.violationCount ?? 0}
      />

      <SubmitConfirmationDialog
        open={showSubmitDialog}
        onOpenChange={setShowSubmitDialog}
        onConfirm={handleSubmitConfirmation}
        isSubmitPending={isSubmitPending}
      />
    </>
  )
}

export const ExamPage = () => (
  <Suspense>
    <ExamPageContent />
  </Suspense>
)

export default ExamPage

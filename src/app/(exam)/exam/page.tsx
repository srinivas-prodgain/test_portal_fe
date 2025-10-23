'use client'

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import type {
  TAttemptResponse,
  TAttemptStatus,
  TViolationType
} from '@/types/exam'
import {
  useGetAttempt,
  useGetQuestions,
  useRegisterEvent,
  useSubmitAttempt,
  useUpdateAnswer
} from '@/hooks/api'
import { useDevtoolsGuard } from '@/hooks/use-devtools-guard'
import { useDisableCopyPaste } from '@/hooks/use-disable-copy-paste'
import { useFullscreenGuard } from '@/hooks/use-fullscreen-guard'

import { ACTIVE_STATUS_LABEL } from '@/constants/exam'

import { ExamLayout, MissingCandidateNotice, SubmitConfirmationDialog } from './components'

export const ExamPageContent = () => {
  const router = useRouter()
  const candidateId = useSearchParams().get('candidate_id')

  // API Hooks
  const attemptQuery = useGetAttempt(
    { candidateId: candidateId ?? '' },
    { enabled: Boolean(candidateId) }
  )
  const questionsQuery = useGetQuestions({ enabled: Boolean(candidateId) })
  const { mutateAsync: submitAttempt, isPending: isSubmitPending } =
    useSubmitAttempt()
  const { mutateAsync: registerEvent } = useRegisterEvent()
  const { mutateAsync: updateAnswer } = useUpdateAnswer()

  // State
  const [attemptInfo, setAttempt] = useState<TAttemptResponse | null>(null)
  const [attemptStatus, setAttemptStatus] = useState<TAttemptStatus>('running')
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [showWarningDialog, setShowWarningDialog] = useState(false)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [isProcessingViolation, setIsProcessingViolation] = useState(false)
  const [answersCache, setAnswersCache] = useState<Record<string, string>>({})
  const [timeRemainingLabel, setTimeRemainingLabel] = useState('--:--')

  // Refs
  const stateRefs = useRef({
    attemptInfo,
    attemptStatus,
    currentQuestionIndex,
    currentAnswer,
    answersCache
  })

  // Computed Values
  const questions = useMemo(
    () => questionsQuery.data ?? [],
    [questionsQuery.data]
  )
  const isAttemptActive = attemptStatus === 'running'
  const currentQuestion = questions[currentQuestionIndex]

  // Keep refs in sync
  useEffect(() => {
    stateRefs.current = {
      attemptInfo,
      attemptStatus,
      currentQuestionIndex,
      currentAnswer,
      answersCache
    }
  }, [attemptInfo, attemptStatus, currentQuestionIndex, currentAnswer, answersCache])

  // Security Hooks
  useDisableCopyPaste({ isActive: isAttemptActive })
  useDevtoolsGuard({ isActive: isAttemptActive })
  const { requestFullscreen } = useFullscreenGuard({
    isActive: isAttemptActive
  })

  // Request fullscreen when exam starts
  useEffect(() => {
    if (attemptInfo && isAttemptActive) {
      void requestFullscreen()
    }
  }, [attemptInfo, isAttemptActive, requestFullscreen])

  // Initialize answers cache from server data
  useEffect(() => {
    if (!attemptInfo?.answers) return
    const cache: Record<string, string> = {}
    attemptInfo.answers.forEach((answer) => {
      cache[answer.questionId] = answer.answers
    })
    setAnswersCache(cache)
  }, [attemptInfo?.answers])

  // Submit Attempt
  const handleSubmitAttempt = useCallback(async (isAutoSubmit = false): Promise<void> => {
    const { attemptInfo, attemptStatus, currentQuestionIndex, currentAnswer, answersCache } =
      stateRefs.current
    const attemptId = attemptInfo?.attemptId

    if (
      !attemptId ||
      attemptStatus !== 'running' ||
      isSubmitPending
    ) {
      return
    }

    // Prepare all answers from cache including current answer
    const currentQ = questions[currentQuestionIndex]
    const allAnswers = { ...answersCache }

    // Include current answer in the cache
    if (currentQ && currentAnswer.trim()) {
      allAnswers[currentQ.questionId] = currentAnswer
    }

    // Convert cached answers to the format expected by API
    const answersToSubmit = Object.entries(allAnswers)
      .filter(([, answer]) => answer.trim()) // Only include non-empty answers
      .map(([questionId, answer]) => ({
        questionId,
        answers: answer
      }))

    try {
      await submitAttempt({ attemptId, answers: answersToSubmit, isAutoSubmit })
      const finalStatus = isAutoSubmit ? 'auto_submitted' : 'submitted'
      setAttemptStatus(finalStatus)
      router.replace(`/submit?status=${finalStatus}`)
    } catch (error) {
      console.error('Submission failed:', error)
    }
  }, [
    isSubmitPending,
    questions,
    submitAttempt,
    router
  ])

  // Handle Violations
  const handleViolation = useCallback(
    async (type: TViolationType): Promise<void> => {
      const { attemptInfo, attemptStatus, currentQuestionIndex, currentAnswer, answersCache } = stateRefs.current
      if (
        !attemptInfo?.attemptId ||
        attemptStatus !== 'running' ||
        isProcessingViolation
      ) {
        return
      }

      setIsProcessingViolation(true)

      try {
        // Prepare all answers from cache including current answer
        const currentQ = questions[currentQuestionIndex]
        const allAnswers = { ...answersCache }

        // Include current answer in the cache
        if (currentQ && currentAnswer.trim()) {
          allAnswers[currentQ.questionId] = currentAnswer
        }

        // Convert cached answers to the format expected by API
        const answersToSend = Object.entries(allAnswers)
          .filter(([, answer]) => answer.trim()) // Only include non-empty answers
          .map(([questionId, answer]) => ({
            questionId,
            answers: answer
          }))

        const response = await registerEvent({
          attemptId: attemptInfo.attemptId,
          type,
          answers: answersToSend
        })

        // Update violation count in attempt info
        setAttempt((prev) =>
          prev ? { ...prev, violationCount: response.violationCount } : prev
        )

        if (response.action === 'warn') {
          setShowWarningDialog(true)
        } else if (response.action === 'terminate') {
          setAttemptStatus('terminated')
          router.replace('/submit?status=terminated')
        }
      } catch (error) {
        console.error('Failed to register violation:', error)
      } finally {
        setTimeout(() => setIsProcessingViolation(false), 1000)
      }
    },
    [
      isProcessingViolation,
      questions,
      registerEvent,
      router
    ]
  )

  const handleWarningAcknowledge = async (): Promise<void> => {
    setShowWarningDialog(false)
    await requestFullscreen()
  }

  // Timer countdown
  useEffect(() => {
    if (!attemptInfo?.endsAt || !isAttemptActive) {
      setTimeRemainingLabel('00:00')
      return
    }

    const updateTimer = () => {
      const now = new Date().getTime()
      const endTime = new Date(attemptInfo.endsAt).getTime()
      const timeLeft = Math.max(0, endTime - now)

      if (timeLeft === 0) {
        setTimeRemainingLabel('00:00')
        // Auto-submit when time runs out
        void handleSubmitAttempt(true)
        return
      }

      const minutes = Math.floor(timeLeft / 60000)
      const seconds = Math.floor((timeLeft % 60000) / 1000)
      setTimeRemainingLabel(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`)
    }

    updateTimer()
    const intervalId = setInterval(updateTimer, 1000)

    return () => clearInterval(intervalId)
  }, [attemptInfo?.endsAt, isAttemptActive, handleSubmitAttempt])

  // Load existing attempt
  useEffect(() => {
    const existingAttempt = attemptQuery.data
    if (!existingAttempt) return

    setAttempt(existingAttempt)

    if (existingAttempt.status === 'running') {
      if (stateRefs.current.attemptStatus !== 'running')
        setAttemptStatus('running')
    } else if (existingAttempt.status) {
      const status = existingAttempt.status as TAttemptStatus
      if (stateRefs.current.attemptStatus !== status)
        setAttemptStatus(status)
      router.replace(`/submit?status=${status}`)
    }
  }, [attemptQuery.data, router])

  // Security Event Listeners
  useEffect(() => {
    if (!isAttemptActive) return

    const handlers = {
      visibilitychange: () => document.hidden && handleViolation('window-blur'),
      blur: () => handleViolation('window-blur'),
      fullscreenchange: () => {
        // Track fullscreen exit as violation
        if (!document.fullscreenElement) {
          handleViolation('fullscreen')
        }
      },
      copy: (e: Event) => {
        e.preventDefault()
        // Only prevent copy, don't track as violation
      },
      paste: (e: Event) => {
        e.preventDefault()
        // Only prevent paste, don't track as violation
      },
      contextmenu: (e: Event) => e.preventDefault()
    }

    document.addEventListener('visibilitychange', handlers.visibilitychange)
    window.addEventListener('blur', handlers.blur)
    document.addEventListener('fullscreenchange', handlers.fullscreenchange)
    document.addEventListener('copy', handlers.copy)
    document.addEventListener('paste', handlers.paste)
    document.addEventListener('contextmenu', handlers.contextmenu)

    return () => {
      document.removeEventListener(
        'visibilitychange',
        handlers.visibilitychange
      )
      window.removeEventListener('blur', handlers.blur)
      document.removeEventListener(
        'fullscreenchange',
        handlers.fullscreenchange
      )
      document.removeEventListener('copy', handlers.copy)
      document.removeEventListener('paste', handlers.paste)
      document.removeEventListener('contextmenu', handlers.contextmenu)
    }
  }, [isAttemptActive, handleViolation])

  useEffect(() => {
    if (!isAttemptActive) return

    const exitMessage =
      'Refreshing or closing this tab will terminate your exam attempt. Do you want to exit?'

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = exitMessage
    }

    const handleRefreshShortcuts = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      
      // Disable ESC key to prevent easy fullscreen exit
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
        setAttemptStatus('terminated')
        router.replace('/submit?status=terminated')
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('keydown', handleRefreshShortcuts)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('keydown', handleRefreshShortcuts)
    }
  }, [isAttemptActive, router])

  // Load answer when question changes
  useEffect(() => {
    if (!currentQuestion) {
      setCurrentAnswer('')
      return
    }
    setCurrentAnswer(answersCache[currentQuestion.questionId] ?? '')
  }, [currentQuestion, answersCache])

  // Handlers
  const handleAnswerChange = (value: string): void => {
    if (
      !isAttemptActive ||
      !currentQuestion ||
      !attemptInfo
    )
      return

    setCurrentAnswer(value)
    setAnswersCache((prev) => ({
      ...prev,
      [currentQuestion.questionId]: value
    }))
  }

  const handleMove = async (direction: 'next' | 'previous'): Promise<void> => {
    if (
      !currentQuestion ||
      !isAttemptActive ||
      !attemptInfo
    )
      return

    // No API call - just navigate between questions
    setCurrentQuestionIndex((prev) =>
      direction === 'next'
        ? Math.min(prev + 1, Math.max(questions.length - 1, 0))
        : Math.max(prev - 1, 0)
    )
  }

  const handleFinishAttemptClick = async (): Promise<void> => {
    if (
      !isAttemptActive ||
      !attemptInfo
    )
      return

    // Show confirmation dialog instead of directly submitting
    setShowSubmitDialog(true)
  }

  const handleSubmitConfirmation = async (): Promise<void> => {
    // All answers will be saved in bulk during handleSubmitAttempt
    await handleSubmitAttempt()
  }

  // Render guards
  if (!candidateId)
    return <MissingCandidateNotice onNavigate={() => router.push('/form1')} />

  return (
    <>
      <ExamLayout
        statusLabel={
          attemptStatus === 'running'
            ? ACTIVE_STATUS_LABEL
            : attemptStatus === 'terminated'
              ? 'Attempt terminated'
              : attemptStatus === 'auto_submitted'
                ? 'Attempt auto-submitted'
                : 'Attempt submitted'
        }
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

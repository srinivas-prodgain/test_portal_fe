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

import { isAxiosError } from 'axios'

import type {
  TAttemptResponse,
  TAttemptStatus,
  TViolationType
} from '@/types/exam'
import {
  useCreateAttempt,
  useGetAttempt,
  useGetQuestions,
  useRegisterEvent,
  useSubmitAttempt,
  useUpdateAnswer
} from '@/hooks/api'
import { useDevtoolsGuard } from '@/hooks/use-devtools-guard'
import { useDisableCopyPaste } from '@/hooks/use-disable-copy-paste'
import { useFullscreenGuard } from '@/hooks/use-fullscreen-guard'

import {
  ACTIVE_STATUS_LABEL,
  AUTO_SUBMIT_BUFFER_MS,
  formatTimeRemaining
} from '@/constants/exam'

import {
  AttemptErrorState,
  AttemptLoadingState,
  ExamLayout,
  MissingCandidateNotice
} from './components'

export const ExamPageContent = () => {
  const router = useRouter()
  const candidateId = useSearchParams().get('candidate_id')

  // API Hooks
  const {
    mutateAsync: createAttempt,
    isPending: isCreatingAttempt,
    cancel: cancelCreateAttempt
  } = useCreateAttempt()
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
  const [attemptError, setAttemptError] = useState('')
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [showWarningDialog, setShowWarningDialog] = useState(false)
  const [isProcessingViolation, setIsProcessingViolation] = useState(false)
  const [answersCache, setAnswersCache] = useState<Record<string, string>>({})

  // Refs
  const timerFrameRef = useRef<number>(0)
  const timerEndRef = useRef<string | null>(null)
  const handleSubmitAttemptRef = useRef<() => Promise<void>>(() =>
    Promise.resolve()
  )
  const attemptRequestedRef = useRef(false)
  const stateRefs = useRef({
    attemptInfo,
    attemptStatus,
    currentQuestionIndex,
    currentAnswer
  })

  // Computed Values
  const questions = useMemo(
    () => questionsQuery.data ?? [],
    [questionsQuery.data]
  )
  const isAttemptActive = attemptStatus === 'running'
  const currentQuestion = questions[currentQuestionIndex]
  const timeRemainingLabel = formatTimeRemaining({
    milliseconds: timeRemaining
  })
  const shouldShowLoadingState =
    Boolean(candidateId) &&
    !attemptError &&
    (!attemptInfo ||
      attemptQuery.isLoading ||
      attemptQuery.isPending ||
      isCreatingAttempt ||
      questionsQuery.isLoading)

  useEffect(() => {
    const handlePopState = () => {
      if (shouldShowLoadingState) {
        cancelCreateAttempt()
        attemptRequestedRef.current = false
      }
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
      cancelCreateAttempt()
      attemptRequestedRef.current = false
    }
  }, [cancelCreateAttempt, shouldShowLoadingState])

  // Keep refs in sync
  useEffect(() => {
    stateRefs.current = {
      attemptInfo,
      attemptStatus,
      currentQuestionIndex,
      currentAnswer
    }
  }, [attemptInfo, attemptStatus, currentQuestionIndex, currentAnswer])

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

  // Timer Management
  const startTimer = useCallback((endsAt: string) => {
    if (timerFrameRef.current) cancelAnimationFrame(timerFrameRef.current)

    timerEndRef.current = endsAt
    const endTime = new Date(endsAt).getTime()

    const tick = (): void => {
      const remaining = Math.max(endTime - Date.now(), 0)
      setTimeRemaining(remaining)

      if (remaining > AUTO_SUBMIT_BUFFER_MS) {
        timerFrameRef.current = requestAnimationFrame(tick)
      } else {
        if (timerFrameRef.current) {
          cancelAnimationFrame(timerFrameRef.current)
          timerFrameRef.current = 0
        }
        void handleSubmitAttemptRef.current()
      }
    }
    tick()
  }, [])

  const stopTimer = useCallback(() => {
    if (timerFrameRef.current) {
      cancelAnimationFrame(timerFrameRef.current)
      timerFrameRef.current = 0
    }
    timerEndRef.current = null
  }, [])

  // Submit Attempt
  const handleSubmitAttempt = useCallback(async (): Promise<void> => {
    const { attemptInfo, attemptStatus, currentQuestionIndex, currentAnswer } =
      stateRefs.current
    const attemptId = attemptInfo?.attemptId

    if (
      !attemptId ||
      attemptStatus !== 'running' ||
      isSubmitPending ||
      shouldShowLoadingState
    ) {
      return
    }

    stopTimer()

    // Save current answer before submitting
    const currentQ = questions[currentQuestionIndex]
    if (currentQ && currentAnswer.trim()) {
      try {
        await updateAnswer({
          attemptId,
          questionId: currentQ.questionId,
          answers: currentAnswer
        })
      } catch (error) {
        console.error('Failed to save current answer:', error)
      }
    }

    try {
      await submitAttempt({ attemptId, answers: [] })
      setAttemptStatus('submitted')
      router.replace('/submit?status=submitted')
    } catch (error) {
      console.error('Submission failed:', error)
      if (attemptInfo?.endsAt && attemptStatus === 'running') {
        const remaining = new Date(attemptInfo.endsAt).getTime() - Date.now()
        if (remaining > 0) startTimer(attemptInfo.endsAt)
      }
    }
  }, [
    isSubmitPending,
    shouldShowLoadingState,
    questions,
    updateAnswer,
    submitAttempt,
    router,
    stopTimer,
    startTimer
  ])

  useEffect(() => {
    handleSubmitAttemptRef.current = handleSubmitAttempt
  }, [handleSubmitAttempt])

  // Handle Violations
  const handleViolation = useCallback(
    async (type: TViolationType): Promise<void> => {
      const { attemptInfo, attemptStatus } = stateRefs.current
      if (
        !attemptInfo?.attemptId ||
        attemptStatus !== 'running' ||
        isProcessingViolation ||
        shouldShowLoadingState
      ) {
        return
      }

      setIsProcessingViolation(true)

      try {
        const response = await registerEvent({
          attemptId: attemptInfo.attemptId,
          type,
          answers: []
        })

        if (response.action === 'warn') {
          setShowWarningDialog(true)
        } else if (response.action === 'terminate') {
          stopTimer()
          setAttemptStatus('submitted')
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
      shouldShowLoadingState,
      registerEvent,
      stopTimer,
      router
    ]
  )

  const handleWarningAcknowledge = async (): Promise<void> => {
    setShowWarningDialog(false)
    await requestFullscreen()
  }

  // Load existing attempt or create new one
  useEffect(() => {
    const existingAttempt = attemptQuery.data
    if (!existingAttempt) return

    setAttempt(existingAttempt)
    setAttemptError('')

    if (existingAttempt.status === 'running') {
      if (stateRefs.current.attemptStatus === 'submitted') return
      if (stateRefs.current.attemptStatus !== 'running')
        setAttemptStatus('running')
      if (timerEndRef.current !== existingAttempt.endsAt)
        startTimer(existingAttempt.endsAt)
    } else {
      if (stateRefs.current.attemptStatus !== 'submitted')
        setAttemptStatus('submitted')
      stopTimer()
      setTimeRemaining(0)
      if (existingAttempt.status)
        router.replace(`/submit?status=${existingAttempt.status}`)
    }
  }, [attemptQuery.data, router, startTimer, stopTimer])

  // Create attempt if not found
  useEffect(() => {
    if (
      !candidateId ||
      attemptRequestedRef.current ||
      attemptQuery.isLoading ||
      attemptQuery.isFetching ||
      attemptQuery.isSuccess
    ) {
      return
    }

    const error = attemptQuery.error
    if (isAxiosError(error) && error.response?.status === 404) {
      attemptRequestedRef.current = true
      createAttempt(candidateId)
        .then((response: TAttemptResponse) => {
          setAttempt(response)
          setAttemptStatus('running')
          setAttemptError('')
          startTimer(response.endsAt)
        })
        .catch((error) => {
          if ((error as { code?: string }).code === 'ERR_CANCELED') {
            attemptRequestedRef.current = false
            return
          }
          attemptRequestedRef.current = false
          setAttemptError(
            'Unable to create exam attempt. Please refresh and try again.'
          )
        })
    } else {
      setAttemptError(
        'Unable to load exam attempt. Please refresh and try again.'
      )
    }
  }, [
    attemptQuery.error,
    attemptQuery.isFetching,
    attemptQuery.isLoading,
    attemptQuery.isSuccess,
    candidateId,
    createAttempt,
    startTimer
  ])

  // Security Event Listeners
  useEffect(() => {
    if (!isAttemptActive || shouldShowLoadingState) return

    const handlers = {
      visibilitychange: () => document.hidden && handleViolation('window-blur'),
      blur: () => handleViolation('window-blur'),
      fullscreenchange: () =>
        !document.fullscreenElement && handleViolation('fullscreen-exit'),
      copy: (e: Event) => {
        e.preventDefault()
        handleViolation('copy-attempt')
      },
      paste: (e: Event) => {
        e.preventDefault()
        handleViolation('paste-attempt')
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
  }, [isAttemptActive, shouldShowLoadingState, handleViolation])

  // Load answer when question changes
  useEffect(() => {
    if (!currentQuestion) {
      setCurrentAnswer('')
      return
    }
    setCurrentAnswer(answersCache[currentQuestion.questionId] ?? '')
  }, [currentQuestion, answersCache])

  // Cleanup on unmount
  useEffect(() => () => stopTimer(), [stopTimer])

  // Handlers
  const handleAnswerChange = (value: string): void => {
    if (
      !isAttemptActive ||
      !currentQuestion ||
      !attemptInfo ||
      shouldShowLoadingState
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
      !attemptInfo ||
      shouldShowLoadingState
    )
      return

    if (currentAnswer.trim()) {
      try {
        await updateAnswer({
          attemptId: attemptInfo.attemptId,
          questionId: currentQuestion.questionId,
          answers: currentAnswer
        })
      } catch (error) {
        console.error('Failed to save answer:', error)
      }
    }

    setCurrentQuestionIndex((prev) =>
      direction === 'next'
        ? Math.min(prev + 1, Math.max(questions.length - 1, 0))
        : Math.max(prev - 1, 0)
    )
  }

  const handleFinishAttemptClick = async (): Promise<void> => {
    if (
      !isAttemptActive ||
      !attemptInfo ||
      !currentQuestion ||
      shouldShowLoadingState
    )
      return

    if (currentAnswer.trim()) {
      try {
        await updateAnswer({
          attemptId: attemptInfo.attemptId,
          questionId: currentQuestion.questionId,
          answers: currentAnswer
        })
      } catch (error) {
        console.error('Failed to save final answer:', error)
      }
    }

    await handleSubmitAttempt()
  }

  // Render guards
  if (!candidateId)
    return <MissingCandidateNotice onNavigate={() => router.push('/form1')} />
  if (attemptError && !attemptInfo)
    return <AttemptErrorState message={attemptError} />
  if (shouldShowLoadingState) return <AttemptLoadingState />

  return (
    <ExamLayout
      statusLabel={
        attemptStatus === 'running' ? ACTIVE_STATUS_LABEL : 'Attempt submitted'
      }
      timeRemainingLabel={timeRemainingLabel}
      currentQuestionIndex={currentQuestionIndex}
      questionsCount={questions.length}
      currentQuestion={currentQuestion}
      currentAnswer={currentAnswer}
      isAttemptActive={isAttemptActive}
      isSubmitPending={isSubmitPending}
      onAnswerChange={handleAnswerChange}
      onMove={handleMove}
      onFinish={handleFinishAttemptClick}
      showWarningDialog={showWarningDialog}
      onWarningDialogChange={setShowWarningDialog}
      onWarningAcknowledge={handleWarningAcknowledge}
    />
  )
}

export const ExamPage = () => (
  <Suspense fallback={<AttemptLoadingState />}>
    <ExamPageContent />
  </Suspense>
)

export default ExamPage

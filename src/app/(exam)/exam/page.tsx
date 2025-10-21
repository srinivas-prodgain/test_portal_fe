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

import type { TAttemptResponse, TQuestion, TViolationType } from '@/types/exam'
import {
  useCreateAttempt,
  useGetAttempt,
  useGetQuestions,
  useRegisterEvent,
  useSubmitAttempt
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
  const searchParams = useSearchParams()
  const candidateId = searchParams.get('candidate_id')

  const { mutateAsync: createAttempt, isPending: isCreatingAttempt } =
    useCreateAttempt()
  const attemptQuery = useGetAttempt(
    { candidate_id: candidateId ?? '' },
    { enabled: Boolean(candidateId) }
  )
  const { mutateAsync: submitAttempt, isPending: isSubmitPending } =
    useSubmitAttempt()
  const { mutateAsync: registerEvent } = useRegisterEvent()

  const [attemptInfo, setAttemptInfo] = useState<TAttemptResponse | null>(null)
  const [attemptStatus, setAttemptStatus] = useState<'running' | 'submitted'>(
    'running'
  )
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [attemptError, setAttemptError] = useState('')
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [showWarningDialog, setShowWarningDialog] = useState(false)
  const [isProcessingViolation, setIsProcessingViolation] = useState(false)

  const timerFrameRef = useRef<number>(0)
  const timerEndRef = useRef<string | null>(null)
  const handleSubmitAttemptRef = useRef<() => Promise<void>>(() =>
    Promise.resolve()
  )
  const attemptRequestedRef = useRef(false)
  const answersRef = useRef<Record<string, string>>({})
  const questionsRef = useRef<TQuestion[]>([])
  const attemptInfoRef = useRef<TAttemptResponse | null>(null)
  const attemptStatusRef = useRef<'running' | 'submitted'>('running')

  const questionsQuery = useGetQuestions({ enabled: Boolean(candidateId) })
  const questions = useMemo(
    () => questionsQuery.data ?? [],
    [questionsQuery.data]
  )

  const isAttemptActive = attemptStatus === 'running'
  const currentQuestion = questions[currentQuestionIndex]
  const currentAnswer = currentQuestion
    ? (answers[currentQuestion.id] ?? '')
    : ''
  const timeRemainingLabel = formatTimeRemaining({
    milliseconds: timeRemaining
  })

  useEffect(() => {
    questionsRef.current = questions
    attemptStatusRef.current = attemptStatus
    attemptInfoRef.current = attemptInfo
    answersRef.current = answers
  }, [questions, answers, attemptInfo, attemptStatus])

  useDisableCopyPaste({ is_active: isAttemptActive })
  useDevtoolsGuard({ is_active: isAttemptActive })

  const { request_fullscreen: requestFullscreen } = useFullscreenGuard({
    is_active: isAttemptActive
  })

  useEffect(() => {
    if (attemptInfo && isAttemptActive) {
      void requestFullscreen()
    }
  }, [attemptInfo, isAttemptActive, requestFullscreen])

  const startTimer = useCallback((endsAt: string) => {
    if (timerFrameRef.current) {
      cancelAnimationFrame(timerFrameRef.current)
    }

    timerEndRef.current = endsAt
    const endTime = new Date(endsAt).getTime()

    const tick = (): void => {
      const remaining = Math.max(endTime - Date.now(), 0)
      setTimeRemaining(remaining)

      if (remaining > AUTO_SUBMIT_BUFFER_MS) {
        timerFrameRef.current = requestAnimationFrame(tick)
        return
      }

      if (timerFrameRef.current) {
        cancelAnimationFrame(timerFrameRef.current)
        timerFrameRef.current = 0
      }

      void handleSubmitAttemptRef.current()
      console.log('auto submit triggered')
    }

    tick()
  }, [])

  const handleSubmitAttempt = useCallback(async (): Promise<void> => {
    const attemptId = attemptInfoRef.current?.attempt_id
    const attemptEndsAt = attemptInfoRef.current?.endsAt

    if (
      !attemptId ||
      attemptStatusRef.current !== 'running' ||
      isSubmitPending
    ) {
      console.log('Cannot submit:', {
        attemptId,
        status: attemptStatusRef.current
      })
      return
    }

    console.log('Submitting attempt...')
    if (timerFrameRef.current) {
      cancelAnimationFrame(timerFrameRef.current)
      timerFrameRef.current = 0
    }
    timerEndRef.current = null

    const payload = questionsRef.current.map((question) => ({
      questionID: question.id,
      answers: answersRef.current[question.id] ?? ''
    }))

    try {
      await submitAttempt({
        attempt_id: attemptId,
        answers: payload
      })

      setAttemptStatus('submitted')
      router.replace(`/submit?status=submitted`)
    } catch (error) {
      console.error('Submission failed:', error)
      if (attemptStatusRef.current === 'running' && attemptEndsAt) {
        const remaining = new Date(attemptEndsAt).getTime() - Date.now()
        if (remaining > 0) {
          startTimer(attemptEndsAt)
        }
      }
    }
  }, [isSubmitPending, router, startTimer, submitAttempt])

  useEffect(() => {
    handleSubmitAttemptRef.current = handleSubmitAttempt
  }, [handleSubmitAttempt])

  const handleViolation = async (type: TViolationType): Promise<void> => {
    const attemptId = attemptInfoRef.current?.attempt_id

    if (
      !attemptId ||
      attemptStatusRef.current !== 'running' ||
      isProcessingViolation
    ) {
      return
    }

    // Prevent multiple simultaneous violations
    setIsProcessingViolation(true)

    const payload = questionsRef.current.map((question) => ({
      questionID: question.id,
      answers: answersRef.current[question.id] ?? ''
    }))

    try {
      const response = await registerEvent({
        attempt_id: attemptId,
        type,
        answers: payload
      })

      if (response.action === 'warn') {
        // First violation - show warning
        setShowWarningDialog(true)
      } else if (response.action === 'terminate') {
        // Second violation or time expired - terminate exam
        if (timerFrameRef.current) {
          cancelAnimationFrame(timerFrameRef.current)
          timerFrameRef.current = 0
        }
        timerEndRef.current = null
        setAttemptStatus('submitted')
        router.replace(`/submit?status=terminated`)
      }
    } catch (error) {
      console.error('Failed to register violation:', error)
    } finally {
      // Reset after a delay to prevent rapid repeated violations
      setTimeout(() => {
        setIsProcessingViolation(false)
      }, 1000)
    }
  }

  const handleWarningAcknowledge = async (): Promise<void> => {
    setShowWarningDialog(false)
    // Re-request fullscreen after user acknowledges warning
    await requestFullscreen()
  }

  useEffect(() => {
    const existingAttempt = attemptQuery.data

    if (!existingAttempt) {
      return
    }

    setAttemptInfo(existingAttempt)
    setAttemptError('')

    if (existingAttempt.answers?.length) {
      setAnswers((previous) => {
        let hasChanges = false
        const next = { ...previous }

        existingAttempt.answers.forEach(({ questionID, answers }) => {
          if (next[questionID] !== answers) {
            next[questionID] = answers
            hasChanges = true
          }
        })

        return hasChanges ? next : previous
      })
    }

    if (existingAttempt.status === 'running') {
      if (attemptStatusRef.current === 'submitted') {
        return
      }

      if (attemptStatusRef.current !== 'running') {
        setAttemptStatus('running')
      }

      if (timerEndRef.current !== existingAttempt.endsAt) {
        startTimer(existingAttempt.endsAt)
      }

      return
    }

    if (attemptStatusRef.current !== 'submitted') {
      setAttemptStatus('submitted')
    }

    if (timerFrameRef.current) {
      cancelAnimationFrame(timerFrameRef.current)
      timerFrameRef.current = 0
    }
    timerEndRef.current = null
    setTimeRemaining(0)

    if (existingAttempt.status) {
      router.replace(`/submit?status=${existingAttempt.status}`)
    }
  }, [attemptQuery.data, router, startTimer])

  // Listen for violations
  useEffect(() => {
    if (!isAttemptActive) return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation('window-blur')
      }
    }

    const handleBlur = () => {
      handleViolation('window-blur')
    }

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        handleViolation('fullscreen-exit')
      }
    }

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault()
      handleViolation('copy-attempt')
    }

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault()
      handleViolation('paste-attempt')
    }

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('copy', handleCopy)
    document.addEventListener('paste', handlePaste)
    document.addEventListener('contextmenu', handleContextMenu)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('copy', handleCopy)
      document.removeEventListener('paste', handlePaste)
      document.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [isAttemptActive, isProcessingViolation])

  useEffect(() => {
    return () => {
      if (timerFrameRef.current) {
        cancelAnimationFrame(timerFrameRef.current)
        timerFrameRef.current = 0
      }
      timerEndRef.current = null
    }
  }, [])

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
          setAttemptInfo(response)
          setAttemptStatus('running')
          setAttemptError('')
          startTimer(response.endsAt)
        })
        .catch(() => {
          attemptRequestedRef.current = false
          setAttemptError(
            'Unable to create exam attempt. Please refresh and try again.'
          )
        })

      return
    }

    setAttemptError(
      'Unable to load exam attempt. Please refresh and try again.'
    )
  }, [
    attemptQuery.error,
    attemptQuery.isFetching,
    attemptQuery.isLoading,
    attemptQuery.isSuccess,
    candidateId,
    createAttempt,
    startTimer
  ])

  useEffect(() => {
    if (!questions.length) {
      return
    }

    setAnswers((previous) => {
      let hasChanges = false
      const next = { ...previous }

      questions.forEach((question) => {
        if (next[question.id] === undefined) {
          next[question.id] = ''
          hasChanges = true
        }
      })

      return hasChanges ? next : previous
    })
  }, [questions])

  const handleAnswerChange = (value: string): void => {
    if (!currentQuestion || !isAttemptActive) {
      return
    }

    setAnswers((previous) => ({
      ...previous,
      [currentQuestion.id]: value
    }))
  }

  const handleMove = (direction: 'next' | 'previous'): void => {
    if (!currentQuestion || !isAttemptActive) {
      return
    }

    setCurrentQuestionIndex((previous) => {
      if (direction === 'next') {
        return Math.min(previous + 1, Math.max(questions.length - 1, 0))
      }

      return Math.max(previous - 1, 0)
    })
  }

  const handleFinishAttemptClick = async (): Promise<void> => {
    if (!isAttemptActive) {
      return
    }

    await handleSubmitAttempt()
  }

  const isAttemptLoading =
    Boolean(candidateId) &&
    (attemptQuery.isLoading || attemptQuery.isPending || isCreatingAttempt)
  const isQuestionsLoading = Boolean(candidateId) && questionsQuery.isLoading
  const shouldShowLoadingState =
    !attemptError &&
    Boolean(candidateId) &&
    (!attemptInfo || isAttemptLoading || isQuestionsLoading)

  if (!candidateId) {
    return <MissingCandidateNotice onNavigate={() => router.push('/form1')} />
  }

  if (attemptError && !attemptInfo) {
    return <AttemptErrorState message={attemptError} />
  }

  if (shouldShowLoadingState) {
    return <AttemptLoadingState />
  }

  const statusLabel =
    attemptStatus === 'running' ? ACTIVE_STATUS_LABEL : 'Attempt submitted'

  return (
    <ExamLayout
      statusLabel={statusLabel}
      timeRemainingLabel={timeRemainingLabel}
      attemptError={attemptError}
      hasQuestionsError={questionsQuery.isError}
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

export const ExamPage = () => {
  return (
    <Suspense fallback={<AttemptLoadingState />}>
      <ExamPageContent />
    </Suspense>
  )
}

export default ExamPage

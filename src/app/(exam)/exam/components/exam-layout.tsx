'use client'

import type { Dispatch, SetStateAction } from 'react'

import type { TQuestion } from '@/types/exam'

import { ExamHeader } from './exam-header'
import { QuestionPanel } from './question-panel'
import { ViolationWarningDialog } from './violation-warning-dialog'

export const ExamLayout = ({
  timeRemainingLabel,
  currentQuestionIndex,
  questionsCount,
  currentQuestion,
  currentAnswer,
  isAttemptActive,
  isSubmitPending,
  attemptStartTime,
  attemptEndTime,
  onAnswerChange,
  onMove,
  onFinish,
  showWarningDialog,
  onWarningDialogChange,
  onWarningAcknowledge,
  violationCount
}: ExamLayoutProps) => {
  return (
    <div className="min-h-screen bg-background-darker">
      <ExamHeader />

      <div className="relative mx-auto w-full max-w-7xl flex-1 px-2 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
        <main className="flex flex-col h-full">
          <QuestionPanel
            currentQuestionIndex={currentQuestionIndex}
            questionsCount={questionsCount}
            currentQuestion={currentQuestion}
            currentAnswer={currentAnswer}
            isAttemptActive={isAttemptActive}
            isSubmitPending={isSubmitPending}
            onAnswerChange={onAnswerChange}
            onMove={onMove}
            onFinish={onFinish}
            timeRemainingLabel={timeRemainingLabel}
            attemptStartTime={attemptStartTime}
            attemptEndTime={attemptEndTime}
          />
        </main>
      </div>

      <ViolationWarningDialog
        open={showWarningDialog}
        onOpenChange={onWarningDialogChange}
        onAcknowledge={onWarningAcknowledge}
        violationCount={violationCount}
      />
    </div>
  )
}

export type ExamLayoutProps = {
  timeRemainingLabel: string
  currentQuestionIndex: number
  questionsCount: number
  currentQuestion?: TQuestion
  currentAnswer: string
  isAttemptActive: boolean
  isSubmitPending: boolean
  attemptStartTime?: string
  attemptEndTime?: string
  onAnswerChange: (value: string) => void
  onMove: (direction: 'next' | 'previous') => void
  onFinish: () => Promise<void>
  showWarningDialog: boolean
  onWarningDialogChange: Dispatch<SetStateAction<boolean>>
  onWarningAcknowledge: () => Promise<void>
  violationCount: number
}

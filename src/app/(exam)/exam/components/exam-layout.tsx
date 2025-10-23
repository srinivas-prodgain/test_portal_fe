'use client'

import type { Dispatch, SetStateAction } from 'react'

import type { TQuestion } from '@/types/exam'

import { QuestionPanel } from './question-panel'
import { ViolationWarningDialog } from './violation-warning-dialog'

export type ExamLayoutProps = {
  statusLabel: string
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
}

export const ExamLayout = ({
  statusLabel,
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
  onWarningAcknowledge
}: ExamLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
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
            statusLabel={statusLabel}
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
      />
    </div>
  )
}

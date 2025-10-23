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
  onAnswerChange,
  onMove,
  onFinish,
  showWarningDialog,
  onWarningDialogChange,
  onWarningAcknowledge
}: ExamLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="relative mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <main className="flex flex-col gap-6">
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

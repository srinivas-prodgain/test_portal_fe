'use client'

import type { Dispatch, SetStateAction } from 'react'

import type { TQuestion } from '@/types/exam'

import { AttemptAlerts } from './attempt-alerts'
import { AttemptStatusHeader } from './attempt-status-header'
import { QuestionPanel } from './question-panel'
import { ViolationWarningDialog } from './violation-warning-dialog'

export type ExamLayoutProps = {
  statusLabel: string
  timeRemainingLabel: string
  attemptError: string
  hasQuestionsError: boolean
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
  attemptError,
  hasQuestionsError,
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
    <div className="flex min-h-screen flex-col bg-background">
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <AttemptStatusHeader
          statusLabel={statusLabel}
          timeRemainingLabel={timeRemainingLabel}
        />
        <main className="flex flex-col gap-6">
          <AttemptAlerts
            attemptError={attemptError}
            hasQuestionsError={hasQuestionsError}
          />
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

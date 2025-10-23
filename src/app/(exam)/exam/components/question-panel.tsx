'use client'

import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ChevronLeft, ChevronRight, CheckCircle2, Clock } from 'lucide-react'

import type { TQuestion } from '@/types/exam'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'

import { TimerProgressBar } from './timer-progress-bar'

const answerSchema = z.object({
  answer: z.string()
})

type AnswerFormValues = z.infer<typeof answerSchema>

type QuestionPanelProps = {
  currentQuestionIndex: number
  questionsCount: number
  currentQuestion?: TQuestion
  currentAnswer: string
  isAttemptActive: boolean
  isSubmitPending: boolean
  statusLabel: string
  timeRemainingLabel: string
  attemptStartTime?: string
  attemptEndTime?: string
  onAnswerChange: (value: string) => void
  onMove: (direction: 'next' | 'previous') => void
  onFinish: () => Promise<void>
}

export const QuestionPanel = ({
  currentQuestionIndex,
  questionsCount,
  currentQuestion,
  currentAnswer,
  isAttemptActive,
  isSubmitPending,
  statusLabel,
  timeRemainingLabel,
  attemptStartTime,
  attemptEndTime,
  onAnswerChange,
  onMove,
  onFinish
}: QuestionPanelProps) => {
  const form = useForm<AnswerFormValues>({
    resolver: zodResolver(answerSchema),
    defaultValues: {
      answer: currentAnswer
    }
  })

  const isActive =
    statusLabel.toLowerCase().includes('active') ||
    statusLabel.toLowerCase().includes('running')
  const isSubmitted = statusLabel.toLowerCase().includes('submitted')

  useEffect(() => {
    form.setValue('answer', currentAnswer)
  }, [currentAnswer, form])

  const handleAnswerChange = (value: string) => {
    form.setValue('answer', value)
    onAnswerChange(value)
  }


  const statusClasses = isActive
    ? 'bg-green-50 text-green-700 border-green-200'
    : isSubmitted
      ? 'bg-blue-50 text-blue-700 border-blue-200'
      : 'bg-amber-50 text-amber-700 border-amber-200'
  const displayStatus = isActive
    ? 'Active'
    : isSubmitted
      ? 'Submitted'
      : statusLabel

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 px-3 py-4">
      {/* Professional Header */}
      <div className="bg-white border !border-gray-200 rounded-lg shadow-sm">
        <div className="px-4 py-4 lg:px-6 lg:py-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6">
              {/* Question Counter */}
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 border !border-blue-100">
                  <span className="text-base font-semibold text-blue-700">
                    {currentQuestionIndex + 1}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">Question</p>
                  <p className="text-base font-semibold text-gray-900">
                    {currentQuestionIndex + 1} of {questionsCount || 1}
                  </p>
                </div>
              </div>

              {/* Timer */}
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 border !border-gray-100">
                  <Clock className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">Time Remaining</p>
                  <p className="text-base font-semibold text-gray-900 font-mono">
                    {timeRemainingLabel}
                  </p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center">
              <span
                className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium border ${statusClasses}`}
              >
                {displayStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Timer Progress Bar */}
        {attemptStartTime && attemptEndTime && (
          <div className="px-4 pb-4 lg:px-6 lg:pb-5">
            <TimerProgressBar
              startTime={attemptStartTime}
              endTime={attemptEndTime}
            />
          </div>
        )}
      </div>

      {/* Question Card */}
      <Card className="bg-white border !border-gray-200 rounded-lg shadow-sm flex-1">
        <CardHeader className="px-4 py-4 lg:px-6 lg:py-5 !border-b !border-gray-100">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                Q{currentQuestionIndex + 1}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold leading-relaxed text-gray-900 mb-1 break-words">
                {currentQuestion?.question ?? 'Loading question...'}
              </CardTitle>
              <p className="text-sm text-gray-500">
                Please provide a detailed answer in the text area below.
              </p>
            </div>
          </div>
        </CardHeader>

        <Form {...form}>
          <CardContent className="px-4 py-4 lg:px-6 lg:py-5">
            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      placeholder="Type your answer here..."
                      className="min-h-[16rem] lg:min-h-[18rem] resize-none rounded-lg border !border-gray-300 bg-white p-4 lg:p-5 text-base leading-relaxed text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-500"
                      disabled={!isAttemptActive}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex flex-col gap-3 border-t !border-gray-100 bg-gray-50 px-4 py-4 lg:px-6 lg:py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onMove('previous')}
                disabled={currentQuestionIndex === 0 || !isAttemptActive}
                className="h-10 gap-2 rounded-lg border !border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onMove('next')}
                disabled={
                  currentQuestionIndex >= questionsCount - 1 || !isAttemptActive
                }
                className="h-10 gap-2 rounded-lg border !border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Button
              type="button"
              onClick={onFinish}
              disabled={isSubmitPending || !isAttemptActive}
              className="h-10 gap-2 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 !border-white/30 border-t-white" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Submit Assessment
                </>
              )}
            </Button>
          </CardFooter>
        </Form>
      </Card>
    </div>
  )
}

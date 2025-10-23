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

  const progress =
    questionsCount > 0
      ? Math.min(100, ((currentQuestionIndex + 1) / questionsCount) * 100)
      : 0

  const statusClasses = isActive
    ? 'bg-violet-100 text-violet-600'
    : isSubmitted
      ? 'bg-emerald-100 text-emerald-600'
      : 'bg-amber-100 text-amber-700'
  const displayStatus = isActive
    ? 'Active'
    : isSubmitted
      ? 'Submitted'
      : statusLabel

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-10">
      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-50 text-violet-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Time Remaining
              </p>
              <p className="text-lg font-semibold text-slate-900">
                {timeRemainingLabel}
              </p>
            </div>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-4 py-1 text-sm font-medium ${statusClasses}`}
          >
            {displayStatus}
          </span>
          <p className="text-sm font-semibold text-slate-500">
            Question {currentQuestionIndex + 1} of {questionsCount || 1}
          </p>
        </div>
        <div className="h-1.5 w-full bg-slate-100">
          <div
            className="h-full rounded-full bg-violet-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Card className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <CardHeader className="px-8 pb-0 pt-10">
          <CardTitle className="text-[1.75rem] font-semibold leading-snug text-slate-900">
            {currentQuestion?.question ?? 'Loading question...'}
          </CardTitle>
        </CardHeader>

        <Form {...form}>
          <CardContent className="px-8 pb-6 pt-6">
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
                      className="min-h-[18rem] resize-none rounded-lg border border-slate-100 bg-white p-6 text-base leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200 disabled:bg-slate-100"
                      disabled={!isAttemptActive}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50 px-8 pb-8 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onMove('previous')}
                disabled={currentQuestionIndex === 0 || !isAttemptActive}
                className="h-11 gap-2 rounded-full border border-slate-100 bg-white px-6 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronLeft className="h-5 w-5" />
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onMove('next')}
                disabled={
                  currentQuestionIndex >= questionsCount - 1 || !isAttemptActive
                }
                className="h-11 gap-2 rounded-full border border-slate-100 bg-white px-6 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            <Button
              type="button"
              onClick={onFinish}
              disabled={isSubmitPending || !isAttemptActive}
              className="h-11 gap-2 rounded-full bg-violet-600 px-8 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-40"
            >
              {isSubmitPending ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5" />
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

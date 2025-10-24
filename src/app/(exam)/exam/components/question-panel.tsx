'use client'

import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, Info } from 'lucide-react'

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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'

import { TimerProgressBar } from './timer-progress-bar'

export const QuestionPanel = ({
  currentQuestionIndex,
  questionsCount,
  currentQuestion,
  currentAnswer,
  isAttemptActive,
  isSubmitPending,
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

  useEffect(() => {
    form.setValue('answer', currentAnswer)
  }, [currentAnswer, form])

  const handleAnswerChange = (value: string) => {
    form.setValue('answer', value)
    onAnswerChange(value)
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 px-3 py-4">
      {/* Professional Header */}
      <div className="bg-card border rounded-lg shadow-sm">
        <div className="px-4 py-4 lg:px-6 lg:py-5">
          {/* Single Row: Question Counter, Progress Bar, and Timer */}
          <div className="flex items-center gap-6">
            {/* Question Counter */}
            <p className="text-lg font-semibold text-foreground whitespace-nowrap">
              {currentQuestionIndex + 1} of {questionsCount || 1}
            </p>

            {/* Timer Progress Bar */}
            {attemptStartTime && attemptEndTime && (
              <div className="flex-1">
                <TimerProgressBar
                  startTime={attemptStartTime}
                  endTime={attemptEndTime}
                />
              </div>
            )}

            {/* Timer with Info Icon */}
            <div className="flex items-center space-x-2.5">
              <div className="flex h-8 w-8 items-center justify-center">
                <Clock className="h-5 w-5 text-foreground" strokeWidth={1.5} />
              </div>
              <p className="text-lg font-semibold text-foreground font-mono tabular-nums">
                {timeRemainingLabel}
              </p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex h-5 w-5 items-center justify-center cursor-pointer">
                    <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  sideOffset={12}
                  className="bg-primary text-primary-foreground border-0 px-4 py-2.5 text-sm font-medium shadow-lg"
                >
                  <p>This timer is for the whole assignment</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <Card className="bg-card border rounded-lg shadow-sm flex-1">
        <CardHeader className="px-4 py-4 lg:px-6 lg:py-5 border-b">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                <span className="text-sm font-semibold text-primary">
                  {currentQuestionIndex + 1}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold leading-relaxed text-foreground break-words">
                {currentQuestion?.question ?? 'Loading question...'}
              </CardTitle>
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
                      className="h-[24rem] lg:h-[28rem] max-h-[32rem] resize-none rounded-lg border bg-card p-4 lg:p-5 text-base leading-relaxed text-foreground placeholder:text-muted-foreground focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/15 disabled:bg-muted disabled:text-muted-foreground overflow-y-auto"
                      disabled={!isAttemptActive}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex flex-col gap-3 border-t px-4 py-4 lg:px-6 lg:py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onMove('previous')}
                disabled={currentQuestionIndex === 0 || !isAttemptActive}
                className="h-10 flex-1 gap-1.5 rounded-lg border bg-transparent px-2 text-xs font-medium hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer lg:w-[110px] lg:flex-none lg:gap-2 lg:px-4 lg:text-sm"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onMove('next')}
                disabled={
                  currentQuestionIndex >= questionsCount - 1 || !isAttemptActive
                }
                className="h-10 flex-1 gap-1.5 rounded-lg border bg-transparent px-2 text-xs font-medium hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer lg:w-[110px] lg:flex-none lg:gap-2 lg:px-4 lg:text-sm"
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Button
              type="button"
              onClick={onFinish}
              disabled={isSubmitPending || !isAttemptActive}
              className="h-10 w-[30%] gap-1.5 rounded-lg bg-primary/90 px-2 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer lg:w-auto lg:gap-2 lg:px-6 lg:text-sm"
            >
              {isSubmitPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  <span className="hidden sm:inline">Submitting...</span>
                  <span className="sm:hidden">Submit</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Submit Assessment</span>
                  <span className="sm:hidden">Submit</span>
                </>
              )}
            </Button>
          </CardFooter>
        </Form>
      </Card>
    </div>
  )
}

type QuestionPanelProps = {
  currentQuestionIndex: number
  questionsCount: number
  currentQuestion?: TQuestion
  currentAnswer: string
  isAttemptActive: boolean
  isSubmitPending: boolean
  timeRemainingLabel: string
  attemptStartTime?: string
  attemptEndTime?: string
  onAnswerChange: (value: string) => void
  onMove: (direction: 'next' | 'previous') => void
  onFinish: () => Promise<void>
}

const answerSchema = z.object({
  answer: z.string()
})

type AnswerFormValues = z.infer<typeof answerSchema>

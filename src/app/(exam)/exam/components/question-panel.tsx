'use client'

import { useEffect } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Clock,
  FileText,
} from 'lucide-react'

import type { TQuestion } from '@/types/exam'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
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

  // Sync form value with prop when currentAnswer changes (e.g., when navigating between questions)
  useEffect(() => {
    form.setValue('answer', currentAnswer)
  }, [currentAnswer, form])

  const handleAnswerChange = (value: string) => {
    form.setValue('answer', value)
    onAnswerChange(value)
  }

  return (
    <section className="flex justify-center">
      <Card className="flex h-[75vh] w-full max-w-4xl flex-col border-0 shadow-xl">
        <CardHeader className="flex flex-col gap-3 border-b border-border/50 bg-gradient-to-r from-card to-card/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <CardDescription className="text-sm font-medium">
                Question {currentQuestionIndex + 1} of {questionsCount || 1}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Auto-saved</span>
            </div>
          </div>
          <CardTitle className="text-xl leading-relaxed">
            {currentQuestion?.question ?? 'Loading question...'}
          </CardTitle>
        </CardHeader>
        
        <Form {...form}>
          <CardContent className="flex-1 p-6">
            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem className="h-full">
                  <FormControl>
                    <Textarea
                      {...field}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      placeholder="Type your response here... Be detailed and specific in your answer."
                      className="h-full min-h-[18.75rem] resize-none border-0 bg-transparent text-base leading-relaxed focus-visible:ring-0 focus-visible:ring-offset-0"
                      disabled={!isAttemptActive}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4 border-t border-border/50 bg-muted/20 p-6 sm:flex-row sm:justify-between">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onMove('previous')}
                disabled={currentQuestionIndex === 0 || !isAttemptActive}
                className="h-10 gap-2"
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
                className="h-10 gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              type="button"
              onClick={onFinish}
              disabled={isSubmitPending || !isAttemptActive}
              className="h-10 gap-2 bg-green-600 hover:bg-green-700"
            >
              {isSubmitPending ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Submitting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Finish Assessment
                </div>
              )}
            </Button>
          </CardFooter>
        </Form>
      </Card>
    </section>
  )
}

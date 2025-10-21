'use client'

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
import { Textarea } from '@/components/ui/textarea'

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
}: QuestionPanelProps) => (
  <section className="flex justify-center">
    <Card className="flex h-[75vh] w-full max-w-4xl flex-col">
      <CardHeader className="flex flex-col gap-2">
        <CardDescription>
          Question {currentQuestionIndex + 1} of {questionsCount || 1}
        </CardDescription>
        <CardTitle>
          {currentQuestion?.question ?? 'Loading question...'}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <Textarea
          value={currentAnswer}
          onChange={(event) => onAnswerChange(event.target.value)}
          placeholder="Type your response here"
          className="h-full min-h-[240px]"
          disabled={!isAttemptActive}
        />
      </CardContent>
      <CardFooter className="justify-between">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onMove('previous')}
            disabled={currentQuestionIndex === 0 || !isAttemptActive}
            className="border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => onMove('next')}
            disabled={
              currentQuestionIndex >= questionsCount - 1 || !isAttemptActive
            }
            className="border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground"
          >
            Next
          </Button>
        </div>
        <Button
          onClick={() => void onFinish()}
          disabled={isSubmitPending || !isAttemptActive}
        >
          {isSubmitPending ? 'Saving...' : 'Finish Attempt'}
        </Button>
      </CardFooter>
    </Card>
  </section>
)

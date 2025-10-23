import { useMutation } from '@tanstack/react-query'

import type { TSavedAnswerPayload, TViolationType } from '@/types/exam'
import { api } from '@/lib/api'

const attemptsEndpoint = '/attempts'

type TRegisterEventPayload = {
  attemptId: string
  type: TViolationType
  answers: TSavedAnswerPayload[]
}

type TRegisterEventResponse = {
  message: string
  data: {
    action: 'warn' | 'terminate'
    violation_count: number
  }
}

const postViolationEvent = async ({
  attemptId,
  type,
  answers
}: TRegisterEventPayload): Promise<{ action: 'warn' | 'terminate'; violationCount: number }> => {
  const response = await api.post<TRegisterEventResponse>(
    `${attemptsEndpoint}/${attemptId}/event`,
    {
      type,
      answers: answers.map((answer) => ({
        question_id: answer.questionId,
        answers: answer.answers
      }))
    }
  )

  return {
    action: response.data.data!.action,
    violationCount: response.data.data!.violation_count
  }
}

export const useRegisterEvent = () =>
  useMutation({
    mutationFn: postViolationEvent
  })

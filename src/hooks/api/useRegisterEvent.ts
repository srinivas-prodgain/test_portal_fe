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
  }
}

const postViolationEvent = async ({
  attemptId,
  type,
  answers
}: TRegisterEventPayload): Promise<{ action: 'warn' | 'terminate' }> => {
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

  return response.data.data!
}

export const useRegisterEvent = () =>
  useMutation({
    mutationFn: postViolationEvent
  })

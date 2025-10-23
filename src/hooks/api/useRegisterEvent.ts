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
  action: 'warn' | 'terminate'
}

const postViolationEvent = async ({
  attemptId,
  type,
  answers
}: TRegisterEventPayload): Promise<TRegisterEventResponse> => {
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

  return response.data
}

export const useRegisterEvent = () =>
  useMutation({
    mutationFn: postViolationEvent
  })

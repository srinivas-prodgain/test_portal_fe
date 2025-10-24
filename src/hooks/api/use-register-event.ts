import { useMutation } from '@tanstack/react-query'

import type { TSavedAnswerPayload, TViolationType } from '@/types/exam'
import type { TApiPromise, TMutationOpts } from '@/types/api'
import { api } from '@/lib/api'

type TRegisterEventPayload = {
  attemptId: string
  type: TViolationType
  answers: TSavedAnswerPayload[]
}

type TRegisterEventResult = {
  action: 'warn' | 'terminate'
  violationCount: number
}

type TRegisterEventResponse = {
  message: string
  data: {
    action: 'warn' | 'terminate'
    violation_count: number
  }
}

const registerEvent = async ({
  attemptId,
  type,
  answers
}: TRegisterEventPayload): TApiPromise<TRegisterEventResult> => {
  const response = await api.post<TRegisterEventResponse>(
    `/attempts/${attemptId}/event`,
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

export const useRegisterEvent = (
  options?: TMutationOpts<TRegisterEventPayload, TRegisterEventResult>
) => {
  return useMutation({
    mutationKey: ['useRegisterEvent'],
    mutationFn: registerEvent,
    ...options
  })
}

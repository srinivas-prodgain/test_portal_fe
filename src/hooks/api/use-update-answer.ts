import { useMutation } from '@tanstack/react-query'

import type { TApiPromise, TMutationOpts } from '@/types/api'
import { api } from '@/lib/api'

type TUpdateAnswerPayload = {
  attemptId: string
  questionId: string
  answers: string
}

type TUpdateAnswerResult = {
  message: string
  data: {
    question_id: string
    answers: string
  }
}

type TUpdateAnswerResponse = {
  message: string
  data: {
    question_id: string
    answers: string
  }
}

const updateAnswer = async ({
  attemptId,
  questionId,
  answers
}: TUpdateAnswerPayload): TApiPromise<TUpdateAnswerResult> => {
  const response = await api.patch<TUpdateAnswerResponse>(
    `/attempts/${attemptId}/answer`,
    {
      question_id: questionId,
      answers
    }
  )
  return response.data
}

export const useUpdateAnswer = (
  options?: TMutationOpts<TUpdateAnswerPayload, TUpdateAnswerResult>
) => {
  return useMutation({
    mutationKey: ['useUpdateAnswer'],
    mutationFn: updateAnswer,
    ...options
  })
}

import { useMutation } from '@tanstack/react-query'

import type { TSavedAnswerPayload } from '@/types/exam'
import type { TApiPromise, TMutationOpts } from '@/types/api'
import { api } from '@/lib/api'

type TSubmitAttemptPayload = {
  attemptId: string
  answers: TSavedAnswerPayload[]
  isAutoSubmit?: boolean
}

type TSubmitAttemptResponse = {
  message: string
}

const submitAttempt = async ({
  attemptId,
  answers,
  isAutoSubmit = false
}: TSubmitAttemptPayload): TApiPromise<void> => {
  await api.post<TSubmitAttemptResponse>(`/attempts/${attemptId}/submit`, {
    answers: answers.map((answer) => ({
      question_id: answer.questionId,
      answers: answer.answers
    })),
    is_auto_submit: isAutoSubmit
  })
}

export const useSubmitAttempt = (
  options?: TMutationOpts<TSubmitAttemptPayload, void>
) => {
  return useMutation({
    mutationKey: ['useSubmitAttempt'],
    mutationFn: submitAttempt,
    ...options
  })
}

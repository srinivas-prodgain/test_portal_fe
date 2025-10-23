import { useMutation } from '@tanstack/react-query'

import type { TSavedAnswerPayload } from '@/types/exam'
import { api } from '@/lib/api'

const attemptsEndpoint = '/attempts'

type TSubmitAttemptPayload = {
  attemptId: string
  answers: TSavedAnswerPayload[]
}

const submitAttempt = async ({
  attemptId,
  answers
}: TSubmitAttemptPayload): Promise<void> => {
  await api.post<void>(`${attemptsEndpoint}/${attemptId}/submit`, {
    answers: answers.map((answer) => ({
      question_id: answer.questionId,
      answers: answer.answers
    }))
  })
}

export const useSubmitAttempt = () =>
  useMutation({
    mutationFn: submitAttempt
  })

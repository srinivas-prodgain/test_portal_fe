import { useMutation } from '@tanstack/react-query'

import type { TSavedAnswerPayload } from '@/types/exam'
import { api } from '@/lib/api'

const attemptsEndpoint = '/attempts'

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
}: TSubmitAttemptPayload): Promise<void> => {
  await api.post<TSubmitAttemptResponse>(`${attemptsEndpoint}/${attemptId}/submit`, {
    answers: answers.map((answer) => ({
      question_id: answer.questionId,
      answers: answer.answers
    })),
    is_auto_submit: isAutoSubmit
  })
}

export const useSubmitAttempt = () =>
  useMutation({
    mutationFn: submitAttempt
  })

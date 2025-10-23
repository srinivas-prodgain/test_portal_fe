import { useMutation } from '@tanstack/react-query'

import { api } from '@/lib/api'

const attemptsEndpoint = '/attempts'

type TUpdateAnswerPayload = {
  attemptId: string
  questionId: string
  answers: string
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
}: TUpdateAnswerPayload): Promise<TUpdateAnswerResponse> => {
  const response = await api.patch<TUpdateAnswerResponse>(
    `${attemptsEndpoint}/${attemptId}/answer`,
    {
      question_id: questionId,
      answers
    }
  )
  return response.data
}

export const useUpdateAnswer = () =>
  useMutation({
    mutationFn: updateAnswer
  })

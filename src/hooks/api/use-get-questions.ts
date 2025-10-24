import { useQuery } from '@tanstack/react-query'

import type { TQuestion } from '@/types/exam'
import type { TApiPromise, TQueryOpts } from '@/types/api'
import { api } from '@/lib/api'

type TGetQuestionsParams = {
  enabled: boolean
}

type TRawQuestion = {
  question_id: string
  question: string
}

type TGetQuestionsResponse = {
  message: string
  data: {
    questions: TRawQuestion[]
  }
}

const getQuestions = async (): TApiPromise<TQuestion[]> => {
  const response = await api.get<TGetQuestionsResponse>('/questions')

  return response.data.data!.questions.map((question) => ({
    questionId: question.question_id,
    question: question.question
  }))
}

export const useGetQuestions = (
  params: TGetQuestionsParams,
  options?: TQueryOpts<TQuestion[]>
) => {
  return useQuery({
    queryKey: ['useGetQuestions', params],
    queryFn: getQuestions,
    enabled: params.enabled,
    staleTime: Infinity,
    ...options
  })
}

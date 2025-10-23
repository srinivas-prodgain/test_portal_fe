import { useQuery } from '@tanstack/react-query'

import type { TQuestion } from '@/types/exam'
import { api } from '@/lib/api'

const questionsEndpoint = '/questions'
const questionsQueryKey = ['questions'] as const

type TRawQuestion = {
  question_id: string
  question: string
}

type TGetQuestionsResponse = {
  questions: TRawQuestion[]
}

const fetchQuestions = async (): Promise<TQuestion[]> => {
  const response = await api.get<TGetQuestionsResponse>(questionsEndpoint)

  return response.data.questions.map((question) => ({
    questionId: question.question_id,
    question: question.question
  }))
}

export const useGetQuestions = ({ enabled }: { enabled: boolean }) =>
  useQuery({
    queryKey: questionsQueryKey,
    queryFn: fetchQuestions,
    enabled,
    staleTime: Infinity
  })

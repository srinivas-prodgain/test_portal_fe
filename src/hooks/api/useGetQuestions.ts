import { useQuery } from '@tanstack/react-query'

import type { TQuestion } from '@/types/exam'
import { api_client } from '@/lib/api'

const questions_endpoint = '/questions'
const questions_query_key = ['questions'] as const

const fetch_questions = async (): Promise<TQuestion[]> => {
  const response = await api_client.get<{ questions: TQuestion[] }>(
    questions_endpoint
  )
  return response.data.questions
}

export const useGetQuestions = ({ enabled }: { enabled: boolean }) =>
  useQuery({
    queryKey: questions_query_key,
    queryFn: fetch_questions,
    enabled,
    staleTime: Infinity
  })

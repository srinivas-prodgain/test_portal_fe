import { useQuery } from '@tanstack/react-query'

import type { TAttemptResponse, TAttemptStatus, TSavedAnswerPayload } from '@/types/exam'
import { api } from '@/lib/api'

type TGetAttemptParams = {
  candidateId: string
}

type TRawAttemptAnswer = {
  question_id: string
  answers: string
}

type TRawAttemptResponse = {
  attempt_id: string
  start_at: string
  ends_at: string
  status: TAttemptStatus
  violation_count: number
  answers: TRawAttemptAnswer[]
}

type TGetAttemptResponse = TAttemptResponse & {
  status: TAttemptStatus
  violationCount: number
  answers: TSavedAnswerPayload[]
}

const getAttempt = async ({
  candidateId
}: TGetAttemptParams): Promise<TGetAttemptResponse> => {
  const response = await api.get<TRawAttemptResponse>('/attempts', {
    params: { candidate_id: candidateId }
  })

  const data = response.data

  return {
    attemptId: data.attempt_id,
    startAt: data.start_at,
    endsAt: data.ends_at,
    status: data.status,
    violationCount: data.violation_count,
    answers: data.answers.map((answer) => ({
      questionId: answer.question_id,
      answers: answer.answers
    }))
  }
}

export const useGetAttempt = (
  params: TGetAttemptParams,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ['useGetAttempt', params],
    queryFn: () => getAttempt(params),
    enabled: options?.enabled ?? true
  })
}

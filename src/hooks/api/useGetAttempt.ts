import { useQuery } from '@tanstack/react-query'

import type { TAttemptResponse, TAttemptStatus, TAttemptViolation, TSavedAnswerPayload, TViolationType } from '@/types/exam'
import { api } from '@/lib/api'

type TGetAttemptParams = {
  candidateId: string
}

type TRawAttemptAnswer = {
  question_id: string
  answers: string
}

type TRawAttemptViolation = {
  type: TViolationType
  timestamp: string
}

type TRawAttemptResponse = {
  message: string
  data: {
    attempt_id: string
    start_at: string
    ends_at: string
    status: TAttemptStatus
    violation_count: number
    violations?: TRawAttemptViolation[]
    answers: TRawAttemptAnswer[]
  }
}

type TGetAttemptResponse = TAttemptResponse & {
  status: TAttemptStatus
  violationCount: number
  violations?: TAttemptViolation[]
  answers: TSavedAnswerPayload[]
}

const getAttempt = async ({
  candidateId
}: TGetAttemptParams): Promise<TGetAttemptResponse> => {
  const response = await api.get<TRawAttemptResponse>('/attempts', {
    params: { candidate_id: candidateId }
  })

  const data = response.data.data!

  return {
    attemptId: data.attempt_id,
    startAt: data.start_at,
    endsAt: data.ends_at,
    status: data.status,
    violationCount: data.violation_count,
    violations: data.violations?.map((violation) => ({
      type: violation.type,
      timestamp: violation.timestamp
    })),
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

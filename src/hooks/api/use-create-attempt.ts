import { useMutation } from '@tanstack/react-query'

import type { TAttemptResponse } from '@/types/exam'
import type { TApiPromise, TMutationOpts } from '@/types/api'
import { api } from '@/lib/api'

type TCreateAttemptPayload = {
  candidateId: string
}

type TCreateAttemptResponse = {
  message: string
  data: {
    attempt_id: string
    start_at: string
    ends_at: string
    violation_count: number
  }
}

const createAttempt = async ({
  candidateId
}: TCreateAttemptPayload): TApiPromise<TAttemptResponse> => {
  const response = await api.post<TCreateAttemptResponse>('/attempts', {
    candidate_id: candidateId
  })

  const data = response.data.data!

  return {
    attemptId: data.attempt_id,
    startAt: data.start_at,
    endsAt: data.ends_at,
    violationCount: data.violation_count
  }
}

export const useCreateAttempt = (
  options?: TMutationOpts<TCreateAttemptPayload, TAttemptResponse>
) => {
  return useMutation({
    mutationKey: ['useCreateAttempt'],
    mutationFn: createAttempt,
    ...options
  })
}

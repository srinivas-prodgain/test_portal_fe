import { useMutation } from '@tanstack/react-query'

import type { TAttemptResponse } from '@/types/exam'
import { api } from '@/lib/api'

const attemptsEndpoint = '/attempts'

type TCreateAttemptResponse = {
  message: string
  data: {
    attempt_id: string
    start_at: string
    ends_at: string
  }
}

export const useCreateAttempt = () => {
  const mutation = useMutation({
    mutationFn: async (candidateId: string): Promise<TAttemptResponse> => {
      const response = await api.post<TCreateAttemptResponse>(
        attemptsEndpoint,
        {
          candidate_id: candidateId
        }
      )

      const data = response.data.data!

      return {
        attemptId: data.attempt_id,
        startAt: data.start_at,
        endsAt: data.ends_at
      }
    }
  })

  return mutation
}

import { useMutation } from '@tanstack/react-query'

import type { TAttemptResponse } from '@/types/exam'
import { api_client } from '@/lib/api'

const attempts_endpoint = '/attempts'

const post_attempt = async (
  candidate_id: string
): Promise<TAttemptResponse> => {
  const response = await api_client.post<TAttemptResponse>(attempts_endpoint, {
    candidate_id
  })

  return response.data
}

export const useCreateAttempt = () =>
  useMutation({
    mutationFn: post_attempt
  })

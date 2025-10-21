import { useQuery } from '@tanstack/react-query'

import type { TAttemptResponse } from '@/types/exam'
import { api_client } from '@/lib/api'

type TGetAttemptParams = {
  candidate_id: string
}

type TGetAttemptResponse = TAttemptResponse & {
  status: string
  violationCount: number
  answers: Array<{
    questionID: string
    answers: string
  }>
}

const get_attempt = async ({
  candidate_id
}: TGetAttemptParams): Promise<TGetAttemptResponse> => {
  const response = await api_client.get<TGetAttemptResponse>('/attempts', {
    params: { candidate_id }
  })

  return response.data
}

export const useGetAttempt = (
  params: TGetAttemptParams,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ['useGetAttempt', params],
    queryFn: () => get_attempt(params),
    enabled: options?.enabled ?? true
  })
}

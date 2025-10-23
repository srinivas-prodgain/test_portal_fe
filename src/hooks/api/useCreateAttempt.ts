import { useCallback, useRef } from 'react'

import { useMutation } from '@tanstack/react-query'

import type { TAttemptResponse } from '@/types/exam'
import { api } from '@/lib/api'

const attemptsEndpoint = '/attempts'

type TCreateAttemptResponse = {
  attempt_id: string
  start_at: string
  ends_at: string
}

export const useCreateAttempt = () => {
  const abortControllerRef = useRef<AbortController | null>(null)

  const mutation = useMutation({
    mutationFn: async (candidateId: string): Promise<TAttemptResponse> => {
      // Abort any in-flight request before issuing a new one
      abortControllerRef.current?.abort()

      const controller = new AbortController()
      abortControllerRef.current = controller

      try {
        const response = await api.post<TCreateAttemptResponse>(
          attemptsEndpoint,
          {
            candidate_id: candidateId
          },
          { signal: controller.signal }
        )

        const data = response.data

        return {
          attemptId: data.attempt_id,
          startAt: data.start_at,
          endsAt: data.ends_at
        }
      } finally {
        abortControllerRef.current = null
      }
    }
  })

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  return {
    ...mutation,
    cancel
  }
}

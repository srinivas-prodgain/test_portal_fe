import { useCallback, useRef } from 'react'

import { useMutation } from '@tanstack/react-query'

import type { TCandidatePayload } from '@/types/exam'
import { api } from '@/lib/api'

const candidatesEndpoint = '/candidates'

type TCreateCandidateResponse = {
  candidate_id: string
}

export const useCreateCandidate = () => {
  const abortControllerRef = useRef<AbortController | null>(null)

  const mutation = useMutation({
    mutationFn: async (
      payload: TCandidatePayload
    ): Promise<{ candidateId: string }> => {
      // Abort any in-flight request before issuing a new one
      abortControllerRef.current?.abort()

      const controller = new AbortController()
      abortControllerRef.current = controller

      try {
        const response = await api.post<TCreateCandidateResponse>(
          candidatesEndpoint,
          {
            email: payload.email,
            linkedin_profile_url: payload.linkedinProfileUrl,
            github_profile_url: payload.githubProfileUrl,
            resume: payload.resume
          },
          { signal: controller.signal }
        )

        return {
          candidateId: response.data.candidate_id
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

import { useMutation } from '@tanstack/react-query'

import type { TCandidatePayload } from '@/types/exam'
import { api } from '@/lib/api'

const candidatesEndpoint = '/candidates'

type TCreateCandidateResponse = {
  message: string
  data: {
    candidate_id: string
  }
}

export const useCreateCandidate = () => {
  const mutation = useMutation({
    mutationFn: async (
      payload: TCandidatePayload
    ): Promise<{ candidateId: string }> => {
      const response = await api.post<TCreateCandidateResponse>(
        candidatesEndpoint,
        {
          email: payload.email,
          linkedin_profile_url: payload.linkedinProfileUrl,
          github_profile_url: payload.githubProfileUrl,
          resume: payload.resume
        }
      )

      return {
        candidateId: response.data.data!.candidate_id
      }
    }
  })

  return mutation
}

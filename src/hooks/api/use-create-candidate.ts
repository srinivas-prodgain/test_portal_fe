import { useMutation } from '@tanstack/react-query'

import type { TCandidatePayload } from '@/types/exam'
import type { TApiPromise, TMutationOpts } from '@/types/api'
import { api } from '@/lib/api'

type TCreateCandidatePayload = {
  payload: TCandidatePayload
}

type TCreateCandidateResult = {
  candidateId: string
}

type TCreateCandidateResponse = {
  message: string
  data: {
    candidate_id: string
  }
}

const createCandidate = async ({
  payload
}: TCreateCandidatePayload): TApiPromise<TCreateCandidateResult> => {
  const response = await api.post<TCreateCandidateResponse>('/candidates', {
    email: payload.email,
    linkedin_profile_url: payload.linkedinProfileUrl,
    github_profile_url: payload.githubProfileUrl,
    resume: payload.resume
  })

  return {
    candidateId: response.data.data!.candidate_id
  }
}

export const useCreateCandidate = (
  options?: TMutationOpts<TCreateCandidatePayload, TCreateCandidateResult>
) => {
  return useMutation({
    mutationKey: ['useCreateCandidate'],
    mutationFn: createCandidate,
    ...options
  })
}

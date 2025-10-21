import { useMutation } from "@tanstack/react-query";

import { api_client } from "@/lib/api";
import type { TCandidatePayload } from "@/types/exam";

const candidates_endpoint = "/candidates";

const post_candidate = async (payload: TCandidatePayload): Promise<{ candidate_id: string }> => {
  const response = await api_client.post<{ candidate_id: string }>(candidates_endpoint, payload);
  return response.data;
};

export const useCreateCandidate = () =>
  useMutation({
    mutationFn: post_candidate,
  });

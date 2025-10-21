import { useMutation } from "@tanstack/react-query";

import { api_client } from "@/lib/api";
import type { TSavedAnswerPayload } from "@/types/exam";

const attempts_endpoint = "/attempts";

const submit_attempt = async (payload: {
  attempt_id: string;
  answers: TSavedAnswerPayload[];
}): Promise<void> => {
  const { attempt_id, answers } = payload;
  await api_client.post<void>(`${attempts_endpoint}/${attempt_id}/submit`, { answers });
};

export const useSubmitAttempt = () =>
  useMutation({
    mutationFn: submit_attempt,
  });

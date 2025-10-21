import { useMutation } from "@tanstack/react-query";

import { api_client } from "@/lib/api";
import type { TSavedAnswerPayload, TViolationType } from "@/types/exam";

const attempts_endpoint = "/attempts";

const post_violation_event = async (payload: {
  attempt_id: string;
  type: TViolationType;
  answers: TSavedAnswerPayload[];
}): Promise<{ action: "warn" | "terminate" | "expired" }> => {
  const { attempt_id, type, answers } = payload;
  const response = await api_client.post<{ action: "warn" | "terminate" | "expired" }>(
    `${attempts_endpoint}/${attempt_id}/event`,
    { type, answers }
  );

  return response.data;
};

export const useRegisterEvent = () =>
  useMutation({
    mutationFn: post_violation_event,
  });

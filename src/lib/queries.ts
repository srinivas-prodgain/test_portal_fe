import { useMutation, useQuery } from "@tanstack/react-query";

import { api_client } from "./api";
import type {
  TCandidatePayload,
  TAttemptResponse,
  TSavedAnswerPayload,
  TQuestion,
  TViolationType,
} from "@/types/exam";

const candidates_endpoint = "/candidates";
const questions_endpoint = "/questions";
const attempts_endpoint = "/attempts";

const questions_query_key = ["questions"] as const;

const fetch_questions = async (): Promise<TQuestion[]> => {
  const response = await api_client.get<{ questions: TQuestion[] }>(questions_endpoint);
  return response.data.questions;
};

const post_candidate = async (payload: TCandidatePayload): Promise<{ candidate_id: string }> => {
  const response = await api_client.post<{ candidate_id: string }>(candidates_endpoint, payload);
  return response.data;
};

const post_attempt = async (candidate_id: string): Promise<TAttemptResponse> => {
  const response = await api_client.post<TAttemptResponse>(attempts_endpoint, {
    candidate_id,
  });

  return response.data;
};


const submit_attempt = async (payload: {
  attempt_id: string;
  answers: TSavedAnswerPayload[];
}): Promise<void> => {
  const { attempt_id, answers } = payload;
  await api_client.post<void>(`${attempts_endpoint}/${attempt_id}/submit`, { answers });
};

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

export const useQuestionsQuery = ({ enabled }: { enabled: boolean }) =>
  useQuery({
    queryKey: questions_query_key,
    queryFn: fetch_questions,
    enabled,
    staleTime: Infinity,
  });

export const useCreateCandidateMutation = () =>
  useMutation({
    mutationFn: post_candidate,
  });

export const useCreateAttemptMutation = () =>
  useMutation({
    mutationFn: post_attempt,
  });


export const useSubmitAttemptMutation = () =>
  useMutation({
    mutationFn: submit_attempt,
  });

export const useRegisterEventMutation = () =>
  useMutation({
    mutationFn: post_violation_event,
  });

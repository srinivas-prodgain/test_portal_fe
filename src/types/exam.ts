export type TViolationType =
  | "window-blur"
  | "window-focus-change";

export type TAttemptStatus = "running" | "submitted" | "terminated" | "expired";

export type TQuestion = {
  id: string;
  question: string;
};

export type TAttemptTiming = {
  startAt: string;
  endsAt: string;
};

export type TAttemptResponse = TAttemptTiming & {
  attempt_id: string;
};

export type TCandidatePayload = {
  email: string;
  linkedin_profile_url: string;
  github_profile_url: string;
  resume?: string;
};

export type TSavedAnswerPayload = {
  questionID: string;
  answers: string;
};

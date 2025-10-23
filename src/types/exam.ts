export type TViolationType =
  | 'window-blur'
  | 'window-focus-change'
  | 'devtools-open'

export type TAttemptStatus = 'running' | 'submitted' | 'auto_submitted' | 'terminated'

export type TQuestion = {
  questionId: string
  question: string
}

export type TAttemptTiming = {
  startAt: string
  endsAt: string
}

export type TAttemptResponse = TAttemptTiming & {
  attemptId: string
  answers?: TSavedAnswerPayload[]
}

export type TCandidatePayload = {
  email: string
  linkedinProfileUrl: string
  githubProfileUrl: string
  resume?: string
}

export type TSavedAnswerPayload = {
  questionId: string
  answers: string
}

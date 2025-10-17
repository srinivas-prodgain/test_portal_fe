"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AxiosError } from "axios";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useDisableCopyPaste } from "@/hooks/use-disable-copy-paste";
import { useDevtoolsGuard } from "@/hooks/use-devtools-guard";
import { useFullscreenGuard } from "@/hooks/use-fullscreen-guard";
import { useWindowChangePolicy } from "@/hooks/use-window-change-policy";
import {
  useCreateAttemptMutation,
  useQuestionsQuery,
  useRegisterEventMutation,
  useSubmitAttemptMutation,
} from "@/lib/queries";
import type { TAttemptResponse, TAttemptStatus, TQuestion, TViolationType } from "@/types/exam";

const format_time_remaining = (milliseconds: number): string => {
  const total_seconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(total_seconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (total_seconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
};

const status_messages: Record<TAttemptStatus, string> = {
  running: "Attempt in progress",
  submitted: "Attempt submitted successfully",
  terminated: "Attempt terminated due to policy violation",
  expired: "Time up — attempt expired",
};

const get_violation_message = (type: TViolationType): string => {
  if (type === "window-blur") {
    return "Tab or window change detected. Please remain focused on the exam. Another violation will end the exam.";
  }

  if (type === "window-focus-change") {
    return "Focus change detected. Please keep your attention on the exam. Another violation will end the exam.";
  }

  return "Policy violation detected. Please remain focused on the exam. Another violation will end the exam.";
};

function ExamPageContent() {
  const router = useRouter();
  const search_params = useSearchParams();
  const candidate_id = search_params.get("candidate_id");

  const create_attempt_mutation = useCreateAttemptMutation();
  const submit_attempt_mutation = useSubmitAttemptMutation();
  const register_event_mutation = useRegisterEventMutation();

  const [attempt_info, set_attempt_info] = useState<TAttemptResponse | null>(null);
  const [attempt_status, set_attempt_status] = useState<TAttemptStatus>("running");
  const [violation_count, set_violation_count] = useState(0);
  const [warning_open, set_warning_open] = useState(false);
  const [submit_confirmation_open, set_submit_confirmation_open] = useState(false);
  const [last_violation_type, set_last_violation_type] = useState<TViolationType | null>(null);
  const [answers, set_answers] = useState<Record<string, string>>({});
  const [current_question_index, set_current_question_index] = useState(0);
  const [display_remaining_ms, set_display_remaining_ms] = useState(0);
  const [submit_error, set_submit_error] = useState("");
  const [attempt_error, set_attempt_error] = useState("");

  const attempt_status_ref = useRef<TAttemptStatus>("running");
  const timer_frame_ref = useRef<number | undefined>(undefined);
  const timer_start_ref = useRef<number>(0);
  const initial_remaining_ref = useRef<number>(0);
  const attempt_requested_ref = useRef(false);

  const questions_query = useQuestionsQuery(Boolean(candidate_id));
  const questions = useMemo(() => questions_query.data ?? [], [questions_query.data]);

  const attempt_id = attempt_info?.attempt_id ?? "";
  const is_exam_running = attempt_status === "running";
  const current_question: TQuestion | undefined = questions[current_question_index];
  const current_answer = current_question ? answers[current_question.id] ?? "" : "";

  useEffect(() => {
    attempt_status_ref.current = attempt_status;

    if (attempt_status !== "running" && timer_frame_ref.current) {
      cancelAnimationFrame(timer_frame_ref.current);
      timer_frame_ref.current = undefined;
    }
  }, [attempt_status]);

  const handle_auto_submit = useCallback(async () => {
    console.log("🕐 Auto-submit triggered!", {
      attempt_id,
      attempt_status: attempt_status_ref.current,
      questions_count: questions.length,
      answers_count: Object.keys(answers).length
    });

    if (!attempt_id || attempt_status_ref.current !== "running") {
      console.log("❌ Auto-submit aborted: missing attempt_id or not running");
      return;
    }

    if (questions.length === 0) {
      console.log("⚠️ Auto-submit: No questions loaded, retrying in 1 second...");
      // If questions aren't loaded yet, try again in 1 second
      setTimeout(() => {
        console.log("🔄 Auto-submit retry after waiting for questions...");
        handle_auto_submit();
      }, 1000);
      return;
    }

    try {
      console.log("📝 Auto-submit: Preparing answers...");
      // Include all questions, even if not answered
      const all_answers = questions.map((question) => ({
        questionID: question.id,
        answers: answers[question.id] || "",
      }));

      console.log("🚀 Auto-submit: Submitting attempt...", { answers_count: all_answers.length });
      await submit_attempt_mutation.mutateAsync({
        attempt_id,
        answers: all_answers,
      });

      console.log("✅ Auto-submit: Success! Redirecting...");
      set_attempt_status("expired");
      router.replace("/submit?status=expired");
    } catch (error) {
      console.error("❌ Auto-submit failed:", error);
      // If auto-submit fails, still mark as expired and redirect
      set_attempt_status("expired");
      router.replace("/submit?status=expired");
    }
  }, [attempt_id, submit_attempt_mutation, answers, questions, router]);

  const start_timer = useCallback((start_at: string, ends_at: string) => {
    const initial_remaining = new Date(ends_at).getTime() - Date.now();

    // TEMPORARY: Override for testing - set timer to 3 seconds for testing auto-submit
    const test_duration = 3000; // 3 seconds
    const override_remaining = Math.min(initial_remaining, test_duration);

    initial_remaining_ref.current = override_remaining;
    timer_start_ref.current = performance.now();
    set_display_remaining_ms(Math.max(override_remaining, 0));

    console.log("⏰ Timer started!", {
      start_at,
      ends_at,
      original_remaining_ms: initial_remaining,
      test_override_ms: override_remaining,
      test_override_seconds: Math.floor(override_remaining / 1000)
    });

    const tick = () => {
      const elapsed = performance.now() - timer_start_ref.current;
      const remaining = Math.max(initial_remaining_ref.current - elapsed, 0);
      const seconds_remaining = Math.floor(remaining / 1000);

      set_display_remaining_ms(remaining);

      // Log every second for debugging
      if (seconds_remaining <= 15 && seconds_remaining % 1 === 0) {
        console.log(`⏰ Timer tick: ${seconds_remaining}s remaining, status: ${attempt_status_ref.current}`);
      }

      if (remaining > 0 && attempt_status_ref.current === "running") {
        timer_frame_ref.current = requestAnimationFrame(tick);
      } else if (remaining === 0 && attempt_status_ref.current === "running") {
        console.log("⏰ Timer expired! Triggering auto-submit...");
        console.log("Current state:", {
          remaining,
          attempt_status: attempt_status_ref.current,
          attempt_id,
          questions_loaded: questions.length > 0
        });

        // Add alert for debugging
        alert("Timer expired! Auto-submit should trigger now.");

        // Auto-submit when timer expires
        handle_auto_submit();
      } else if (remaining === 0) {
        console.log("⏰ Timer expired but not running:", {
          remaining,
          attempt_status: attempt_status_ref.current
        });
      }
    };

    timer_frame_ref.current = requestAnimationFrame(tick);
  }, [handle_auto_submit]);

  useEffect(() => {
    return () => {
      if (timer_frame_ref.current) {
        cancelAnimationFrame(timer_frame_ref.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!candidate_id || attempt_requested_ref.current) {
      return;
    }

    attempt_requested_ref.current = true;

    create_attempt_mutation
      .mutateAsync(candidate_id)
      .then((response) => {
        console.log("✅ Attempt created successfully:", response);
        set_attempt_info(response);
        set_attempt_status("running");
        set_violation_count(0);
        set_warning_open(false);
        set_submit_error("");
        set_attempt_error("");
        console.log("🚀 Starting timer with:", { startAt: response.startAt, endsAt: response.endsAt });
        start_timer(response.startAt, response.endsAt);
      })
      .catch((error) => {
        console.error("❌ Failed to create attempt:", error);
        set_attempt_error("Unable to create exam attempt. Please refresh and try again.");
      });
  }, [candidate_id, create_attempt_mutation, start_timer]);

  useEffect(() => {
    if (!questions.length) {
      return;
    }

    set_answers((previous) => {
      const next = { ...previous };
      questions.forEach((question) => {
        if (next[question.id] === undefined) {
          next[question.id] = "";
        }
      });
      return next;
    });
  }, [questions]);

  const handle_violation = useCallback(
    async (type: TViolationType) => {
      if (!attempt_id || attempt_status_ref.current !== "running") {
        return;
      }

      try {
        // Include all questions, even if not answered
        const all_answers = questions.map((question) => ({
          questionID: question.id,
          answers: answers[question.id] || "",
        }));

        const response = await register_event_mutation.mutateAsync({
          attempt_id,
          type,
          answers: all_answers,
        });

        set_violation_count((count) => count + 1);
        set_last_violation_type(type);

        if (response.action === "warn") {
          set_warning_open(true);
          return;
        }

        if (response.action === "terminate") {
          set_attempt_status("terminated");
          set_warning_open(false);
          router.replace("/submit?status=terminated");
        }

        if (response.action === "expired") {
          set_attempt_status("expired");
          set_warning_open(false);
          router.replace("/submit?status=expired");
        }
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 409) {
          set_attempt_status("expired");
          set_warning_open(false);
          router.replace("/submit?status=expired");
        }
      }
    },
    [attempt_id, register_event_mutation, answers, questions, router]
  );

  const { request_fullscreen } = useFullscreenGuard({
    is_active: is_exam_running,
  });

  useEffect(() => {
    if (attempt_info && is_exam_running) {
      void request_fullscreen();
    }
  }, [attempt_info, is_exam_running, request_fullscreen]);

  useDisableCopyPaste({
    is_active: is_exam_running,
  });

  useDevtoolsGuard({
    is_active: is_exam_running,
  });

  useWindowChangePolicy({
    is_active: is_exam_running,
    on_violation: (type) => {
      void handle_violation(type);
    },
  });


  const handle_answer_change = (value: string) => {
    if (!current_question) {
      return;
    }

    set_answers((previous) => ({
      ...previous,
      [current_question.id]: value,
    }));
  };

  const handle_move = (direction: "next" | "previous") => {
    if (!current_question) {
      return;
    }

    set_current_question_index((previous) => {
      if (direction === "next") {
        return Math.min(previous + 1, Math.max(questions.length - 1, 0));
      }

      return Math.max(previous - 1, 0);
    });
  };

  const handle_submit_click = () => {
    set_submit_confirmation_open(true);
  };

  const handle_submit_confirm = async () => {
    if (!attempt_id) {
      return;
    }

    set_submit_error("");
    set_submit_confirmation_open(false);

    try {
      // Include all questions, even if not answered
      const all_answers = questions.map((question) => ({
        questionID: question.id,
        answers: answers[question.id] || "",
      }));

      await submit_attempt_mutation.mutateAsync({
        attempt_id,
        answers: all_answers,
      });
      set_attempt_status("submitted");
      router.replace("/submit?status=submitted");
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 409) {
        set_attempt_status("expired");
        set_submit_error("Time up — attempt expired.");
        return;
      }

      set_submit_error("Unable to submit attempt. Please try again.");
    }
  };

  const time_remaining_label = useMemo(() => format_time_remaining(display_remaining_ms), [display_remaining_ms]);

  if (!candidate_id) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Candidate information missing</CardTitle>
            <CardDescription>Return to the intake form to begin your attempt.</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button onClick={() => router.push("/form1")}>Go to Intake Form</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }


  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 rounded-lg border border-border bg-card px-6 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Time remaining</p>
            <p className="text-3xl font-semibold text-foreground">{time_remaining_label}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-muted-foreground">Attempt status</p>
            <p className="text-base font-semibold text-foreground">{status_messages[attempt_status]}</p>
            <p className="text-xs text-muted-foreground">Violations recorded: {violation_count}</p>
          </div>
        </header>

        <main className="flex flex-col gap-6">
          {attempt_error ? (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-destructive">Attempt Setup Failed</CardTitle>
                <CardDescription className="text-destructive">{attempt_error}</CardDescription>
              </CardHeader>
            </Card>
          ) : null}

          {questions_query.isError ? (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-destructive">Failed to Load Questions</CardTitle>
                <CardDescription className="text-destructive">
                  Unable to fetch exam questions. Please refresh and try again.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : null}

          <section className="flex justify-center">
            <Card className="flex h-[75vh] w-full max-w-4xl flex-col">
              <CardHeader className="flex flex-col gap-2">
                <CardDescription>
                  Question {current_question_index + 1} of {questions.length || 7}
                </CardDescription>
                <CardTitle>{current_question?.question ?? "Loading question..."}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <Textarea
                  value={current_answer}
                  onChange={(event) => handle_answer_change(event.target.value)}
                  placeholder="Type your response here"
                  className="h-full min-h-[240px]"
                />
                {submit_error ? (
                  <p className="mt-4 text-sm font-medium text-destructive" role="alert">
                    {submit_error}
                  </p>
                ) : null}
              </CardContent>
              <CardFooter className="justify-between">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handle_move("previous")}
                    disabled={current_question_index === 0}
                    className="border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handle_move("next")}
                    disabled={current_question_index >= questions.length - 1}
                    className="border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    Next
                  </Button>
                </div>
                <Button
                  onClick={handle_submit_click}
                  disabled={submit_attempt_mutation.isPending}
                >
                  {submit_attempt_mutation.isPending ? "Saving..." : "Finish Attempt"}
                </Button>
              </CardFooter>
            </Card>
          </section>
        </main>
      </div>

      <Dialog open={warning_open} onOpenChange={set_warning_open}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stay Focused on the Exam</DialogTitle>
            <DialogDescription>
              {last_violation_type ? get_violation_message(last_violation_type) : "A policy violation was detected."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>Resume Exam</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={submit_confirmation_open} onOpenChange={set_submit_confirmation_open}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Your Exam</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit your exam? Once submitted, you cannot make any changes to your answers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => set_submit_confirmation_open(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handle_submit_confirm}
              disabled={submit_attempt_mutation.isPending}
            >
              {submit_attempt_mutation.isPending ? "Submitting..." : "Yes, Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ExamPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Loading exam...</CardTitle>
            <CardDescription>Please wait while we prepare your exam.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <ExamPageContent />
    </Suspense>
  );
}

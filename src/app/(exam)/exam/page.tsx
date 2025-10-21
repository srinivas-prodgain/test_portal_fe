"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { JSX } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDisableCopyPaste } from "@/hooks/use-disable-copy-paste";
import { useDevtoolsGuard } from "@/hooks/use-devtools-guard";
import { useFullscreenGuard } from "@/hooks/use-fullscreen-guard";
import {
  useCreateAttempt,
  useGetQuestions,
  useSubmitAttempt,
  useRegisterEvent,
} from "@/hooks/api";
import type { TAttemptResponse, TQuestion, TViolationType } from "@/types/exam";

const ACTIVE_STATUS_LABEL = "Attempt in progress";

const formatTimeRemaining = ({ milliseconds }: { milliseconds: number }): string => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
};


export const ExamPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const candidateId = searchParams.get("candidate_id");

  const createAttemptMutation = useCreateAttempt();
  const submitAttemptMutation = useSubmitAttempt();
  const registerEventMutation = useRegisterEvent();

  const [attemptInfo, setAttemptInfo] = useState<TAttemptResponse | null>(null);
  const [attemptStatus, setAttemptStatus] = useState<"running" | "submitted">("running");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [attemptError, setAttemptError] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [isProcessingViolation, setIsProcessingViolation] = useState(false);

  const timerFrameRef = useRef<number>(0);
  const attemptRequestedRef = useRef(false);
  const answersRef = useRef<Record<string, string>>({});
  const questionsRef = useRef<TQuestion[]>([]);
  const attemptInfoRef = useRef<TAttemptResponse | null>(null);
  const attemptStatusRef = useRef<"running" | "submitted">("running");

  const questionsQuery = useGetQuestions({ enabled: Boolean(candidateId) });
  const questions = useMemo(() => questionsQuery.data ?? [], [questionsQuery.data]);

  const isAttemptActive = attemptStatus === "running";
  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] ?? "" : "";
  const timeRemainingLabel = formatTimeRemaining({ milliseconds: timeRemaining });

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  useEffect(() => {
    attemptInfoRef.current = attemptInfo;
  }, [attemptInfo]);

  useEffect(() => {
    attemptStatusRef.current = attemptStatus;
  }, [attemptStatus]);

  useDisableCopyPaste({ is_active: isAttemptActive });
  useDevtoolsGuard({ is_active: isAttemptActive });

  const { request_fullscreen: requestFullscreen } = useFullscreenGuard({
    is_active: isAttemptActive,
  });

  useEffect(() => {
    if (attemptInfo && isAttemptActive) {
      void requestFullscreen();
    }
  }, [attemptInfo, isAttemptActive, requestFullscreen]);

  const handleSubmitAttempt = async (): Promise<void> => {
    const attemptId = attemptInfoRef.current?.attempt_id;

    if (!attemptId || attemptStatusRef.current !== "running") {
      console.log("Cannot submit:", { attemptId, status: attemptStatusRef.current });
      return;
    }

    console.log("Submitting attempt...");

    const payload = questionsRef.current.map((question) => ({
      questionID: question.id,
      answers: answersRef.current[question.id] ?? "",
    }));

    try {
      await submitAttemptMutation.mutateAsync({
        attempt_id: attemptId,
        answers: payload,
      });

      setAttemptStatus("submitted");
      router.replace(`/submit?status=submitted`);
    } catch (error) {
      console.error("Submission failed:", error);
    }
  };

  const handleViolation = async (type: TViolationType): Promise<void> => {
    const attemptId = attemptInfoRef.current?.attempt_id;

    if (!attemptId || attemptStatusRef.current !== "running" || isProcessingViolation) {
      return;
    }

    // Prevent multiple simultaneous violations
    setIsProcessingViolation(true);

    const payload = questionsRef.current.map((question) => ({
      questionID: question.id,
      answers: answersRef.current[question.id] ?? "",
    }));

    try {
      const response = await registerEventMutation.mutateAsync({
        attempt_id: attemptId,
        type,
        answers: payload,
      });

      if (response.action === "warn") {
        // First violation - show warning
        setShowWarningDialog(true);
      } else if (response.action === "terminate") {
        // Second violation or time expired - terminate exam
        setAttemptStatus("submitted");
        router.replace(`/submit?status=terminated`);
      }
    } catch (error) {
      console.error("Failed to register violation:", error);
    } finally {
      // Reset after a delay to prevent rapid repeated violations
      setTimeout(() => {
        setIsProcessingViolation(false);
      }, 1000);
    }
  };

  const handleWarningAcknowledge = async (): Promise<void> => {
    setShowWarningDialog(false);
    // Re-request fullscreen after user acknowledges warning
    await requestFullscreen();
  };

  const startTimer = (endsAt: string) => {
    const endTime = new Date(endsAt).getTime();
    // Submit 500ms before actual expiry to account for network delay
    const AUTO_SUBMIT_BUFFER_MS = 500;

    const tick = (): void => {
      const remaining = Math.max(endTime - Date.now(), 0);
      setTimeRemaining(remaining);

      if (remaining > AUTO_SUBMIT_BUFFER_MS) {
        timerFrameRef.current = requestAnimationFrame(tick);
      } else if (remaining <= AUTO_SUBMIT_BUFFER_MS && remaining > 0) {
        // Auto submit when we hit the buffer threshold
        handleSubmitAttempt();
        console.log("auto submit triggered");
      }
    };

    tick();
  };

  // Listen for violations
  useEffect(() => {
    if (!isAttemptActive) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation("window-blur");
      }
    };

    const handleBlur = () => {
      handleViolation("window-blur");
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        handleViolation("fullscreen-exit");
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      handleViolation("copy-attempt");
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      handleViolation("paste-attempt");
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [isAttemptActive, isProcessingViolation]);

  useEffect(() => {
    return () => {
      if (timerFrameRef.current) {
        cancelAnimationFrame(timerFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!candidateId || attemptRequestedRef.current) {
      return;
    }

    attemptRequestedRef.current = true;

    createAttemptMutation
      .mutateAsync(candidateId)
      .then((response: TAttemptResponse) => {
        setAttemptInfo(response);
        setAttemptStatus("running");
        setAttemptError("");
        startTimer(response.endsAt);
      })
      .catch(() => {
        setAttemptError("Unable to create exam attempt. Please refresh and try again.");
      });
  }, [candidateId, createAttemptMutation, startTimer]);

  useEffect(() => {
    if (!questions.length) {
      return;
    }

    setAnswers((previous) => {
      const next = { ...previous };

      questions.forEach((question) => {
        if (next[question.id] === undefined) {
          next[question.id] = "";
        }
      });

      return next;
    });
  }, [questions]);

  const handleAnswerChange = ({ value }: { value: string }): void => {
    if (!currentQuestion || !isAttemptActive) {
      return;
    }

    setAnswers((previous) => ({
      ...previous,
      [currentQuestion.id]: value,
    }));
  };

  const handleMove = ({ direction }: { direction: "next" | "previous" }): void => {
    if (!currentQuestion || !isAttemptActive) {
      return;
    }

    setCurrentQuestionIndex((previous) => {
      if (direction === "next") {
        return Math.min(previous + 1, Math.max(questions.length - 1, 0));
      }

      return Math.max(previous - 1, 0);
    });
  };

  const handleFinishAttemptClick = async (): Promise<void> => {
    if (!isAttemptActive) {
      return;
    }

    await handleSubmitAttempt();
  };

  if (!candidateId) {
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

  const statusLabel = attemptStatus === "running" ? ACTIVE_STATUS_LABEL : "Attempt submitted";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 rounded-lg border border-border bg-card px-6 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Time remaining</p>
            <p className="text-3xl font-semibold text-foreground">{timeRemainingLabel}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-muted-foreground">Attempt status</p>
            <p className="text-base font-semibold text-foreground">{statusLabel}</p>
          </div>
        </header>

        <main className="flex flex-col gap-6">
          {attemptError ? (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-destructive">Attempt Setup Failed</CardTitle>
                <CardDescription className="text-destructive">{attemptError}</CardDescription>
              </CardHeader>
            </Card>
          ) : null}

          {questionsQuery.isError ? (
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
                  Question {currentQuestionIndex + 1} of {questions.length || 1}
                </CardDescription>
                <CardTitle>{currentQuestion?.question ?? "Loading question..."}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <Textarea
                  value={currentAnswer}
                  onChange={(event) => handleAnswerChange({ value: event.target.value })}
                  placeholder="Type your response here"
                  className="h-full min-h-[240px]"
                  disabled={!isAttemptActive}
                />
              </CardContent>
              <CardFooter className="justify-between">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleMove({ direction: "previous" })}
                    disabled={currentQuestionIndex === 0 || !isAttemptActive}
                    className="border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleMove({ direction: "next" })}
                    disabled={currentQuestionIndex >= questions.length - 1 || !isAttemptActive}
                    className="border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    Next
                  </Button>
                </div>
                <Button
                  onClick={handleFinishAttemptClick}
                  disabled={submitAttemptMutation.isPending || !isAttemptActive}
                >
                  {submitAttemptMutation.isPending ? "Saving..." : "Finish Attempt"}
                </Button>
              </CardFooter>
            </Card>
          </section>
        </main>
      </div>

      {/* Warning Dialog */}
      <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Violation Warning</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p className="font-semibold text-destructive">
                You have violated the exam rules!
              </p>
              <p>
                This is your first and only warning. Violations include:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Switching tabs or windows</li>
                <li>Exiting fullscreen mode</li>
                <li>Attempting to copy or paste</li>
                <li>Opening developer tools</li>
              </ul>
              <p className="font-semibold mt-4">
                If you commit another violation, your exam will be automatically terminated.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleWarningAcknowledge}>
              I Understand
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export const ExamPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Loading exam...</CardTitle>
              <CardDescription>Please wait while we prepare your exam.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <ExamPageContent />
    </Suspense>
  );
};

export default ExamPage;
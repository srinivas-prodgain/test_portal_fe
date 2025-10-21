"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { AxiosError } from "axios";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCandidate } from "@/hooks/api";
import type { TCandidatePayload } from "@/types/exam";

const candidate_form_schema = z.object({
  email: z.string().min(1, "Email is required"),
  linkedin_profile_url: z.string().min(1, "LinkedIn profile is required"),
  github_profile_url: z.string().min(1, "GitHub profile is required"),
  resume: z.string().optional(),
});

const default_form_values: TCandidatePayload = {
  email: "",
  linkedin_profile_url: "",
  github_profile_url: "",
  resume: "",
};

export default function CandidateIntakePage() {
  const router = useRouter();
  const { mutateAsync: create_candidate, isPending } = useCreateCandidate();

  const [form_values, set_form_values] = useState<TCandidatePayload>(default_form_values);
  const [error_message, set_error_message] = useState<string>("");

  const handle_input_change = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;

    set_form_values((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handle_submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    set_error_message("");

    const parsed = candidate_form_schema.safeParse({
      ...form_values,
      resume: form_values.resume ? form_values.resume : undefined,
    });

    if (!parsed.success) {
      set_error_message(parsed.error.errors[0]?.message ?? "Invalid input");
      return;
    }

    try {
      const response = await create_candidate(parsed.data);
      router.replace(`/exam?candidate_id=${response.candidate_id}`);
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 409) {
        set_error_message("Candidate already exists with provided details.");
        return;
      }

      set_error_message("Unable to submit candidate details. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Candidate Intake</CardTitle>
          <CardDescription>Provide your contact details to begin the assessment.</CardDescription>
        </CardHeader>
        <form onSubmit={handle_submit}>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form_values.email}
                onChange={handle_input_change}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin_profile_url">LinkedIn Profile URL</Label>
              <Input
                id="linkedin_profile_url"
                name="linkedin_profile_url"
                placeholder="https://linkedin.com/in/username"
                value={form_values.linkedin_profile_url}
                onChange={handle_input_change}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github_profile_url">GitHub Profile URL</Label>
              <Input
                id="github_profile_url"
                name="github_profile_url"
                placeholder="https://github.com/username"
                value={form_values.github_profile_url}
                onChange={handle_input_change}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resume">Resume (link or file ID)</Label>
              <Textarea
                id="resume"
                name="resume"
                placeholder="Optional: share a link or storage ID for your resume"
                value={form_values.resume ?? ""}
                onChange={handle_input_change}
              />
            </div>
            {error_message ? (
              <p className="text-sm font-medium text-destructive" role="alert">
                {error_message}
              </p>
            ) : null}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              {isPending ? "Submitting..." : "Start Exam"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

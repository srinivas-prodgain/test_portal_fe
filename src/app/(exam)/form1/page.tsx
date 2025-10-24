'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

import { zodResolver } from '@hookform/resolvers/zod'
import { AxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { Mail, Linkedin, Github, FileText, ArrowRight, AlertCircle } from 'lucide-react'

import type { TCandidatePayload } from '@/types/exam'
import { useCreateCandidate, useCreateAttempt, useGetQuestions } from '@/hooks/api'

import { Button } from '@/components/ui/button'
import {
  Card,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const candidateFormSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  linkedinProfileUrl: z
    .string()
    .min(1, 'LinkedIn profile is required')
    .url('Invalid URL'),
  githubProfileUrl: z
    .string()
    .min(1, 'GitHub profile is required')
    .url('Invalid URL'),
  resume: z.string().optional()
})

type CandidateFormValues = z.infer<typeof candidateFormSchema>

export default function CandidateIntakePage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isPreparingExam, setIsPreparingExam] = useState(false)

  const {
    mutateAsync: createCandidate,
    isPending
  } = useCreateCandidate()

  const { mutateAsync: createAttempt } = useCreateAttempt()

  const { refetch: fetchQuestions } = useGetQuestions({ enabled: false })

  const form = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateFormSchema),
    defaultValues: {
      email: '',
      linkedinProfileUrl: '',
      githubProfileUrl: '',
      resume: ''
    }
  })


  const onSubmit = async (data: CandidateFormValues) => {
    try {
      const payload: TCandidatePayload = {
        ...data,
        resume: data.resume || undefined
      }

      const candidateResponse = await createCandidate({ payload })

      setIsPreparingExam(true)

      const [attemptResponse, questionsResponse] = await Promise.all([
        createAttempt({ candidateId: candidateResponse.candidateId }),
        fetchQuestions()
      ])

      const examDataReady = attemptResponse && questionsResponse.data

      if (examDataReady) {
        queryClient.setQueryData(
          ['useGetAttempt', { candidateId: candidateResponse.candidateId }],
          {
            ...attemptResponse,
            status: 'running',
            violations: [],
            answers: []
          }
        )

        queryClient.setQueryData(
          ['useGetQuestions', { enabled: true }],
          questionsResponse.data
        )

        setIsPreparingExam(false)
        router.replace(`/exam?candidate_id=${candidateResponse.candidateId}`)
      }
    } catch (error) {
      setIsPreparingExam(false)

      const isDuplicateCandidate =
        error instanceof AxiosError && error.response?.status === 409

      if (isDuplicateCandidate) {
        form.setError('root', {
          message: 'Candidate already exists with provided details.'
        })
        return
      }

      form.setError('root', {
        message: 'Unable to submit candidate details. Please try again.'
      })
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background-darker">
      <div className="absolute inset-0 z-0 size-full">
        <Image
          fill
          priority
          alt="Background"
          src="/hero-background.svg"
          style={{ objectFit: 'cover' }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
        <Card className="w-full max-w-5xl overflow-hidden rounded-xl border border-white/10 bg-background text-white shadow-2xl">
          <div className="grid md:grid-cols-2">
            {/* Left Side - Information */}
            <div className="flex flex-col justify-between border-r border-white/5 bg-gradient-form rounded-xl p-8 md:p-10">
              <div className="space-y-8">
                <div className="flex items-center">
                  <Image
                    alt="Logo"
                    height={140}
                    src="/prodgain-wordmark-light.svg"
                    width={140}
                  />
                </div>

                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-white">
                      Technical Assessment
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Showcase your skills and join our talent pool
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/5">
                        <span className="text-xs font-medium text-white">1</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-white">Submit Your Details</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Provide your professional profiles to help us understand your background
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/5">
                        <span className="text-xs font-medium text-white">2</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-white">Complete the Assessment</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Answer technical questions in a monitored environment
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/5">
                        <span className="text-xs font-medium text-white">3</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-white">Get Evaluated</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Our team will review your submission and reach out with next steps
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-3 rounded-lg border border-white/5 bg-white/[0.02] p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Important Guidelines
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-white">•</span>
                    <span>Ensure stable internet connection</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-white">•</span>
                    <span>Complete assessment in one session</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex flex-col p-8 md:p-10">
              <div className="mb-6">
                <h2 className="text-lg font-medium text-white">
                  Enter your details to begin the assessment
                </h2>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col">
                  <div className="flex-1 space-y-5">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="block text-sm">
                            Email Address
                          </FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-3 rounded-md border border-border bg-transparent px-4 py-3">
                              <Mail className="h-5 w-5 text-muted-foreground" />
                              <Input
                                type="email"
                                placeholder="you@example.com"
                                autoComplete="email"
                                className="h-full w-full border-0 bg-transparent px-0 text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 [&:-webkit-autofill]:bg-transparent [&:-webkit-autofill]:[-webkit-text-fill-color:hsl(var(--foreground))] [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_hsl(var(--background))_inset]"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="linkedinProfileUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="block text-sm">
                            LinkedIn Profile
                          </FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-3 rounded-md border border-border bg-transparent px-4 py-3">
                              <Linkedin className="h-5 w-5 text-muted-foreground" />
                              <Input
                                placeholder="https://linkedin.com/in/username"
                                className="h-full w-full border-0 bg-transparent px-0 text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 [&:-webkit-autofill]:bg-transparent [&:-webkit-autofill]:[-webkit-text-fill-color:hsl(var(--foreground))] [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_hsl(var(--background))_inset]"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="githubProfileUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="block text-sm">
                            GitHub Profile
                          </FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-3 rounded-md border border-border bg-transparent px-4 py-3">
                              <Github className="h-5 w-5 text-muted-foreground" />
                              <Input
                                placeholder="https://github.com/username"
                                className="h-full w-full border-0 bg-transparent px-0 text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 [&:-webkit-autofill]:bg-transparent [&:-webkit-autofill]:[-webkit-text-fill-color:hsl(var(--foreground))] [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_hsl(var(--background))_inset]"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="resume"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormLabel className="block text-sm">
                              Resume
                            </FormLabel>
                            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              Optional
                            </span>
                          </div>
                          <FormControl>
                            <div className="flex items-center gap-3 rounded-md border border-border bg-transparent px-4 py-3">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <Input
                                placeholder="Share a link to your resume"
                                className="h-full w-full border-0 bg-transparent px-0 text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 [&:-webkit-autofill]:bg-transparent [&:-webkit-autofill]:[-webkit-text-fill-color:hsl(var(--foreground))] [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_hsl(var(--background))_inset]"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.formState.errors.root && (
                      <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        {form.formState.errors.root.message}
                      </div>
                    )}
                  </div>

                  <div className="mt-6">
                    <Button
                      type="submit"
                      disabled={isPending || isPreparingExam}
                      className="flex w-full items-center justify-center gap-2 cursor-pointer"
                    >
                      {isPreparingExam && 'Preparing your exam...'}
                      {isPending && !isPreparingExam && 'Creating your session...'}
                      {!isPending && !isPreparingExam && (
                        <>
                          Start Assessment
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}


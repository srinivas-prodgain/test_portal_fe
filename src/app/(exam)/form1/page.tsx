'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { AxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Mail, Linkedin, Github, FileText, ArrowRight, AlertCircle } from 'lucide-react'

import type { TCandidatePayload } from '@/types/exam'
import { useCreateCandidate, useCreateAttempt, useGetQuestions } from '@/hooks/api'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
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

      // Step 1: Create candidate
      const candidateResponse = await createCandidate(payload)

      // Step 2: Prepare exam (create attempt and load questions in parallel)
      setIsPreparingExam(true)

      const [attemptResponse, questionsResponse] = await Promise.all([
        createAttempt(candidateResponse.candidateId),
        fetchQuestions()
      ])

      // Step 3: Only redirect when both are successful
      if (attemptResponse && questionsResponse.data) {
        setIsPreparingExam(false)
        router.replace(`/exam?candidate_id=${candidateResponse.candidateId}`)
      }
    } catch (error) {
      setIsPreparingExam(false)

      if (error instanceof AxiosError && error.response?.status === 409) {
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
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12">
      <div className="w-full max-w-xl space-y-6">
        <Card className="rounded-3xl border border-gray-100 shadow-sm">
          <CardHeader className="space-y-2 px-8 pt-8">
            <CardTitle className="text-2xl font-semibold text-slate-900">
              Your Information
            </CardTitle>
            <CardDescription className="text-base text-slate-500">
              All fields are required except where noted
            </CardDescription>
          </CardHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6 px-8 pb-2 pt-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2 bg-white">
                      <FormLabel className="text-sm font-medium text-slate-700">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-3 rounded-lg bg-white border border-red-800  px-4">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            autoComplete="email"
                            className="h-12 border-0 bg-transparent text-base focus-visible:ring-0 focus-visible:ring-offset-0"
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
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-slate-700">
                        LinkedIn Profile
                      </FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-white px-4">
                          <Linkedin className="h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="https://linkedin.com/in/username"
                            className="h-12 border-0 bg-transparent text-base focus-visible:ring-0 focus-visible:ring-offset-0"
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
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-slate-700">
                        GitHub Profile
                      </FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-white pl-4">
                          <Github className="h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="https://github.com/username"
                            className="h-12 border-0 bg-transparent text-base focus-visible:ring-0 focus-visible:ring-offset-0"
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
                    <FormItem className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FormLabel className="text-sm font-medium text-slate-700">
                          Resume
                        </FormLabel>
                        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Optional
                        </span>
                      </div>
                      <FormControl>
                        <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-white px-4">
                          <FileText className="h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="Share a link to your resume"
                            className="h-12 border-0 bg-transparent text-base focus-visible:ring-0 focus-visible:ring-offset-0"
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
              </CardContent>

              <CardFooter className="px-8 pb-8 pt-4">
                <Button
                  type="submit"
                  disabled={isPending || isPreparingExam}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-violet-600 text-base font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-50"
                >
                  {isPending || isPreparingExam ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-lg border-2 border-white/30 border-t-white" />
                      {isPreparingExam ? 'Preparing your exam...' : 'Creating your session...'}
                    </>
                  ) : (
                    <>
                      Start Assessment
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  )
}

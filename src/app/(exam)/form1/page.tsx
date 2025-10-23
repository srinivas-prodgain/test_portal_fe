'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { AxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { 
  User, 
  Mail, 
  Linkedin, 
  Github, 
  FileText, 
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

import type { TCandidatePayload } from '@/types/exam'
import { useCreateCandidate } from '@/hooks/api'

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
import { cn } from '@/lib/utils'

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
  const {
    mutateAsync: createCandidate,
    isPending,
    cancel: cancelCreateCandidate
  } = useCreateCandidate()

  const form = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateFormSchema),
    defaultValues: {
      email: '',
      linkedinProfileUrl: '',
      githubProfileUrl: '',
      resume: ''
    }
  })

  useEffect(() => {
    const handlePopState = () => {
      if (isPending) {
        cancelCreateCandidate()
      }
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
      cancelCreateCandidate()
    }
  }, [cancelCreateCandidate, isPending])

  const onSubmit = async (data: CandidateFormValues) => {
    try {
      const payload: TCandidatePayload = {
        ...data,
        resume: data.resume || undefined
      }

      const response = await createCandidate(payload)
      router.replace(`/exam?candidate_id=${response.candidateId}`)
    } catch (error) {
      if ((error as { code?: string }).code === 'ERR_CANCELED') {
        return
      }

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="relative flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 sm:py-8">
        <div className="w-full max-w-2xl">
          {/* Header Section */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground">
              Welcome to the Assessment
            </h1>
            <p className="text-lg text-muted-foreground">
              Let's get started with your candidate information
            </p>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-2 pb-6">
              <CardTitle className="text-2xl font-semibold">Candidate Information</CardTitle>
              <CardDescription className="text-base">
                Please provide your details to begin the technical assessment
              </CardDescription>
            </CardHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-6 p-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm font-medium">
                          <Mail className="h-4 w-4" />
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            autoComplete="email"
                            className="h-11"
                            {...field}
                          />
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
                        <FormLabel className="flex items-center gap-2 text-sm font-medium">
                          <Linkedin className="h-4 w-4" />
                          LinkedIn Profile
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://linkedin.com/in/username"
                            className="h-11"
                            {...field}
                          />
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
                        <FormLabel className="flex items-center gap-2 text-sm font-medium">
                          <Github className="h-4 w-4" />
                          GitHub Profile
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://github.com/username"
                            className="h-11"
                            {...field}
                          />
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
                        <FormLabel className="flex items-center gap-2 text-sm font-medium">
                          <FileText className="h-4 w-4" />
                          Resume (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Share a link or storage ID for your resume"
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.formState.errors.root && (
                    <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <p className="text-sm font-medium text-destructive">
                        {form.formState.errors.root.message}
                      </p>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="p-6 pt-6">
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full h-10 text-base font-medium"
                    size="lg"
                  >
                    {isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Creating your session...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Start Assessment
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>

          {/* Footer Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Your information is secure and will only be used for assessment purposes
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

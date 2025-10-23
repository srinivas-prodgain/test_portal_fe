'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

type TSubmitStatus = 'submitted' | 'auto_submitted' | 'terminated'

const STATUS_CONFIG: Record<
  TSubmitStatus,
  {
    title: string
    description: string
    points: string[]
    accent: string
    icon: React.ReactNode
  }
> = {
  submitted: {
    title: 'Exam Submitted Successfully',
    description:
      'Your responses have been saved and will be reviewed by our team.',
    points: [
      'We will evaluate your answers and reach out with the next steps.',
      'You can safely close this window—no further action is required.'
    ],
    accent: 'bg-emerald-100 text-emerald-600',
    icon: (
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <CheckCircle2 className="h-6 w-6" />
      </div>
    )
  },
  auto_submitted: {
    title: 'Exam Auto-Submitted',
    description:
      'Time expired and your attempt was auto-submitted with your latest answers.',
    points: [
      'Everything you completed before the timer ended has been captured.',
      'Our team will review your responses and follow up shortly.'
    ],
    accent: 'bg-indigo-100 text-indigo-600',
    icon: (
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
        <Clock className="h-6 w-6" />
      </div>
    )
  },
  terminated: {
    title: 'Exam Terminated',
    description:
      'This attempt ended early due to repeated policy violations.',
    points: [
      'Your progress up to the point of termination has been recorded.',
      'Contact the assessment team if you believe this was in error.'
    ],
    accent: 'bg-amber-100 text-amber-700',
    icon: (
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
        <AlertTriangle className="h-6 w-6" />
      </div>
    )
  }
}

const SubmitPageShell = ({
  title,
  description
}: {
  title: string
  description: string
}) => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16">
    <Card className="w-full max-w-xl rounded-3xl border border-slate-100 shadow-sm">
      <CardHeader className="space-y-2 px-8 pt-10 text-center">
        <CardTitle className="text-2xl font-semibold text-slate-800">
          {title}
        </CardTitle>
        <CardDescription className="text-base text-slate-500">
          {description}
        </CardDescription>
      </CardHeader>
    </Card>
  </div>
)

function SubmitPageContent() {
  const searchParams = useSearchParams()
  const statusParam = searchParams.get('status')
  const status = (Object.keys(STATUS_CONFIG).includes(
    statusParam ?? ''
  )
    ? statusParam
    : 'submitted') as keyof typeof STATUS_CONFIG

  const statusInfo = STATUS_CONFIG[status]

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16">
      <Card className="w-full max-w-xl space-y-6 rounded-3xl border border-slate-100 bg-white shadow-sm">
        <CardHeader className="space-y-4 px-8 pt-10 text-center">
          <div className="flex justify-center">{statusInfo.icon}</div>
          <CardTitle className="text-[1.75rem] font-semibold text-slate-900">
            {statusInfo.title}
          </CardTitle>
          <CardDescription className="text-base text-slate-500">
            {statusInfo.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-8 pb-10">
          <div className="space-y-3 rounded-lg bg-slate-50 p-5 text-left text-sm text-slate-600">
            {statusInfo.points.map((text, index) => (
              <div key={index} className="flex items-start gap-3">
                <span
                  className={`mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full ${statusInfo.accent}`}
                />
                <p>{text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SubmitPage() {
  return (
    <Suspense
      fallback={
        <SubmitPageShell
          title="Processing Submission"
          description="Please wait while we finalise your exam status."
        />
      }
    >
      <SubmitPageContent />
    </Suspense>
  )
}

'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

type TSubmitStatus = 'submitted' | 'auto_submitted' | 'terminated'

const SUCCESS_CONFIG = {
  title: 'Exam Submitted Successfully',
  description:
    'Your responses have been saved and will be reviewed by our team.',
  points: [
    'We will evaluate your answers and reach out with the next steps.',
    'You can safely close this window—no further action is required.'
  ],
  accent: 'bg-[#10B981]/20 text-[#10B981]',
  icon: (
    <div className="flex size-16 items-center justify-center">
      <DotLottieReact
        src="https://lottie.host/07307152-3a12-41af-9211-764bc2e065d8/GyQlddACrw.lottie"
        loop={true}
        autoplay={true}
      />
    </div>
  )
}

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
  submitted: SUCCESS_CONFIG,
  auto_submitted: SUCCESS_CONFIG,
  terminated: {
    title: 'Exam Terminated',
    description:
      'This attempt ended early due to repeated policy violations.',
    points: [
      'Your progress up to the point of termination has been recorded.',
      'Contact the assessment team if you believe this was in error.'
    ],
    accent: 'bg-[#EF4444]/20 text-[#EF4444]',
    icon: (
      <div className="flex size-16 items-center justify-center">
        <DotLottieReact
          src="https://lottie.host/c1748831-e413-40a2-be67-c392d8ee251e/VYGQnvx1ZJ.lottie"
          loop={true}
          autoplay={true}
        />
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
  <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#07080A]">
    <div className="absolute inset-0 z-0 size-full">
      <Image
        fill
        priority
        alt="Background"
        src="/hero-background.svg"
        style={{ objectFit: 'cover' }}
      />
    </div>

    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="mb-8 flex items-center">
        <Image
          alt="Prodgain Logo"
          height={120}
          src="/prodgain-wordmark-light.svg"
          width={120}
          priority
        />
      </div>

      <Card className="w-full max-w-2xl overflow-hidden rounded-xl border border-white/10 bg-[#0E0D17] shadow-2xl">
        <CardHeader className="space-y-2 px-8 py-10 text-center md:px-12 md:py-12">
          <CardTitle className="text-2xl font-semibold tracking-tight text-white">
            {title}
          </CardTitle>
          <CardDescription className="text-base text-[#A3A1B0]">
            {description}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
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
  const isSuccess = status !== 'terminated'

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#07080A]">
      <div className="absolute inset-0 z-0 size-full">
        <Image
          fill
          priority
          alt="Background"
          src="/hero-background.svg"
          style={{ objectFit: 'cover' }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-8">
        <div className="mb-8 flex items-center">
          <Image
            alt="Prodgain Logo"
            height={120}
            src="/prodgain-wordmark-light.svg"
            width={120}
            priority
          />
        </div>

        <Card className="w-full max-w-2xl overflow-hidden rounded-xl border border-white/10 bg-[#0E0D17] shadow-2xl">
          <div className="px-8 py-10 md:px-12 md:py-12">
            <div className="flex flex-col items-center text-center">
              <div className="mb-5">{statusInfo.icon}</div>

              <h1 className="text-2xl font-semibold tracking-tight text-white">
                {statusInfo.title}
              </h1>

              <p className="mt-3 text-base text-[#A3A1B0]">
                {statusInfo.description}
              </p>

              <div className="mt-8 w-full space-y-3 rounded-lg border border-white/5 bg-gradient-to-br from-white/[0.02] to-white/[0.01] p-6 text-left">
                <div className="mb-4 flex items-center gap-2">
                  <div className={`h-1.5 w-1.5 rounded-full ${isSuccess ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`} />
                  <p className="text-xs font-medium uppercase tracking-wide text-[#A3A1B0]">
                    Important Information
                  </p>
                </div>

                <div className="space-y-3">
                  {statusInfo.points.map((text, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-1.5 flex h-1 w-1 shrink-0 rounded-full bg-white/40" />
                      <p className="text-sm leading-relaxed text-[#E5E5E5]">{text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {isSuccess && (
                <div className="mt-6 rounded-lg border border-[#10B981]/20 bg-[#10B981]/5 px-4 py-3">
                  <p className="text-sm text-[#10B981]">
                    Thank you for completing the assessment. We appreciate your time and effort.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        <p className="mt-6 text-sm text-[#A3A1B0]">
          You can safely close this window
        </p>
      </div>
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

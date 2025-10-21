'use client'

import { Loader2 } from 'lucide-react'

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

export const AttemptLoadingState = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-col items-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        <CardTitle>Preparing your exam attempt</CardTitle>
        <CardDescription>
          Please hold on while we resume your session.
        </CardDescription>
      </CardHeader>
    </Card>
  </div>
)

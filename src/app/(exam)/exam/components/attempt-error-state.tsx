'use client'

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

type AttemptErrorStateProps = {
  message: string
}

export const AttemptErrorState = ({ message }: AttemptErrorStateProps) => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
    <Card className="w-full max-w-lg border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-destructive">Attempt Setup Failed</CardTitle>
        <CardDescription className="text-destructive">
          {message}
        </CardDescription>
      </CardHeader>
    </Card>
  </div>
)

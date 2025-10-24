'use client'

import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

type AttemptErrorStateProps = {
  message: string
}

export const AttemptErrorState = ({ message }: AttemptErrorStateProps) => (
  <div className="min-h-screen bg-gradient-to-br from-destructive/5 via-background to-destructive/10">
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-6 sm:px-6 sm:py-8 text-center">
      <Card className="w-full max-w-lg border-0 shadow-xl">
        <CardHeader className="flex flex-col items-center gap-4 p-6 pb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/20">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-semibold text-foreground">
              Assessment Setup Failed
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              {message}
            </CardDescription>
          </div>
        </CardHeader>

        <CardFooter className="flex flex-col gap-3 p-6 pt-0">
          <Button
            onClick={() => window.location.reload()}
            className="w-full h-10 gap-2"
            variant="outline"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button
            onClick={() => window.location.href = '/form1'}
            className="w-full h-10 gap-2"
          >
            <Home className="h-4 w-4" />
            Return to Start
          </Button>
        </CardFooter>
      </Card>

      <div className="text-sm text-muted-foreground">
        <p>If this problem persists, please contact support</p>
      </div>
    </div>
  </div>
)

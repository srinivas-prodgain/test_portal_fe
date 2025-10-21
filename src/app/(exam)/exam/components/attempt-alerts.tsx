'use client'

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

type AttemptAlertsProps = {
  attemptError: string
  hasQuestionsError: boolean
}

export const AttemptAlerts = ({
  attemptError,
  hasQuestionsError
}: AttemptAlertsProps) => {
  if (!attemptError && !hasQuestionsError) {
    return null
  }

  return (
    <>
      {attemptError ? (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-destructive">
              Attempt Setup Failed
            </CardTitle>
            <CardDescription className="text-destructive">
              {attemptError}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}
      {hasQuestionsError ? (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-destructive">
              Failed to Load Questions
            </CardTitle>
            <CardDescription className="text-destructive">
              Unable to fetch exam questions. Please refresh and try again.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}
    </>
  )
}

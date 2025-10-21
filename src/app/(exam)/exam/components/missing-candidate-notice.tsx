'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

type MissingCandidateNoticeProps = {
  onNavigate: () => void
}

export const MissingCandidateNotice = ({
  onNavigate
}: MissingCandidateNoticeProps) => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Candidate information missing</CardTitle>
        <CardDescription>
          Return to the intake form to begin your attempt.
        </CardDescription>
      </CardHeader>
      <CardFooter className="justify-center">
        <Button onClick={onNavigate}>Go to Intake Form</Button>
      </CardFooter>
    </Card>
  </div>
)

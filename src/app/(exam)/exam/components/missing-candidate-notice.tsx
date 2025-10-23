'use client'

import { User, ArrowRight, AlertCircle } from 'lucide-react'

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
  <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-6 sm:px-6 sm:py-8 text-center">
      <Card className="w-full max-w-lg border-0 shadow-xl">
        <CardHeader className="flex flex-col items-center gap-4 p-6 pb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <User className="h-8 w-8 text-amber-600" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-semibold text-amber-900">
              Candidate Information Required
            </CardTitle>
            <CardDescription className="text-base text-amber-700">
              Please complete the intake form to begin your assessment
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardFooter className="flex flex-col gap-3 p-6 pt-0">
          <Button 
            onClick={onNavigate} 
            className="w-full h-10 gap-2"
          >
            Complete Intake Form
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <AlertCircle className="h-4 w-4" />
        <span>This step is required to start your assessment</span>
      </div>
    </div>
  </div>
)

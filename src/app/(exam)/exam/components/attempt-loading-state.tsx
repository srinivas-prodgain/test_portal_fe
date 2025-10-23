'use client'

import { Loader2, Clock, BookOpen } from 'lucide-react'

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

export const AttemptLoadingState = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-6 sm:px-6 sm:py-8 text-center">
      <Card className="w-full max-w-lg border-0 shadow-xl">
        <CardHeader className="flex flex-col items-center gap-4 p-6 pb-6">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
              <Loader2 className="h-3 w-3 animate-spin text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-semibold">
              Preparing Your Assessment
            </CardTitle>
            <CardDescription className="text-base">
              Setting up your exam environment and loading questions...
            </CardDescription>
          </div>
        </CardHeader>
        
        <div className="p-6 pt-0">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>Verifying your session</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>Loading questions</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              <span>Initializing timer</span>
            </div>
          </div>
        </div>
      </Card>
      
      <div className="text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>This may take a few moments</span>
        </div>
      </div>
    </div>
  </div>
)

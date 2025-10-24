'use client'

import { Loader2 } from 'lucide-react'

export const ExamLoadingState = () => (
    <div className="min-h-screen bg-background-darker">
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-6">
            <div className="flex flex-col items-center gap-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
                <div className="space-y-2 text-center">
                    <h2 className="text-2xl font-semibold text-foreground">
                        Loading Assessment
                    </h2>
                    <p className="text-base text-muted-foreground">
                        Please wait while we prepare your exam...
                    </p>
                </div>
            </div>
        </div>
    </div>
)


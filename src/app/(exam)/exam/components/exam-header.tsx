'use client'

import Image from 'next/image'

export const ExamHeader = () => {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="mx-auto flex h-16 max-w-[1920px] items-center px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <div className="flex items-center">
                    <Image
                        src="/prodgain-wordmark-dark.svg"
                        alt="Prodgain"
                        width={140}
                        height={36}
                        priority
                        className="h-8 w-auto"
                    />
                </div>
            </div>
        </header>
    )
}


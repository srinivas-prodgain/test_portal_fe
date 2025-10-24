import { useEffect, useState } from 'react'

import type { TAttemptResponse, TQuestion } from '@/types/exam'

type TUseExamAnswersParams = {
    attemptInfo: TAttemptResponse | null
    currentQuestion: TQuestion | undefined
}

export const useExamAnswers = ({ attemptInfo, currentQuestion }: TUseExamAnswersParams) => {
    const [answersCache, setAnswersCache] = useState<Record<string, string>>({})
    const [currentAnswer, setCurrentAnswer] = useState('')

    useEffect(() => {
        if (!attemptInfo?.answers) return

        const cache: Record<string, string> = {}
        attemptInfo.answers.forEach((answer) => {
            cache[answer.questionId] = answer.answers
        })
        setAnswersCache(cache)
    }, [attemptInfo?.answers])

    useEffect(() => {
        if (!currentQuestion) {
            setCurrentAnswer('')
            return
        }
        setCurrentAnswer(answersCache[currentQuestion.questionId] ?? '')
    }, [currentQuestion, answersCache])

    return {
        answersCache,
        setAnswersCache,
        currentAnswer,
        setCurrentAnswer
    }
}


import { useEffect, useState } from 'react'

type TUseExamTimerParams = {
    endsAt: string | null | undefined
    isActive: boolean
    onTimeExpired: () => Promise<void>
}

export const useExamTimer = ({
    endsAt,
    isActive,
    onTimeExpired
}: TUseExamTimerParams) => {
    const [timeRemainingLabel, setTimeRemainingLabel] = useState('--:--')

    useEffect(() => {
        if (!endsAt || !isActive) {
            setTimeRemainingLabel('00:00')
            return
        }

        const updateTimer = async () => {
            const now = new Date().getTime()
            const endTime = new Date(endsAt).getTime()
            const timeLeft = Math.max(0, endTime - now)

            if (timeLeft === 0) {
                setTimeRemainingLabel('00:00')
                await onTimeExpired()
                return
            }

            const minutes = Math.floor(timeLeft / 60000)
            const seconds = Math.floor((timeLeft % 60000) / 1000)
            setTimeRemainingLabel(
                `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
            )
        }

        void updateTimer()
        const intervalId = setInterval(() => void updateTimer(), 1000)

        return () => clearInterval(intervalId)
    }, [endsAt, isActive, onTimeExpired])

    return timeRemainingLabel
}


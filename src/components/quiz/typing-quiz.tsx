'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, XCircle } from 'lucide-react'
import { TTSButton } from '@/components/shared/tts-button'
import { checkAnswer } from '@/hooks/use-quiz'
import type { Card as CardType } from '@/types/database'

interface TypingQuizProps {
  card: CardType
  onAnswer: (userAnswer: string, isCorrect: boolean) => void
}

export function TypingQuiz({ card, onAnswer }: TypingQuizProps) {
  const t = useTranslations('quiz')
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setAnswer('')
    setSubmitted(false)
    inputRef.current?.focus()
  }, [card.id])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!answer.trim() || submitted) return

    const correct = checkAnswer(answer, card.back)
    setIsCorrect(correct)
    setSubmitted(true)
  }

  const handleNext = () => {
    onAnswer(answer, isCorrect)
  }

  return (
    <div className="space-y-6 w-full max-w-lg mx-auto">
      <Card>
        <CardContent className="text-center p-8">
          <div className="flex items-center justify-center gap-2">
            <p className="text-2xl">{card.front}</p>
            <TTSButton text={card.front} />
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          ref={inputRef}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder={t('yourAnswer')}
          disabled={submitted}
          autoFocus
          className="text-lg text-center"
        />

        {!submitted && (
          <Button type="submit" className="w-full" disabled={!answer.trim()}>
            {t('submit')}
          </Button>
        )}
      </form>

      {submitted && (
        <div className="space-y-4">
          <div
            className={`flex items-center justify-center gap-2 text-lg font-medium ${
              isCorrect ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {isCorrect ? (
              <>
                <CheckCircle2 className="h-6 w-6" />
                {t('correct')}
              </>
            ) : (
              <>
                <XCircle className="h-6 w-6" />
                {t('incorrect')}
              </>
            )}
          </div>

          {!isCorrect && (
            <div className="text-center space-y-1">
              <p className="text-sm text-muted-foreground">{t('correctAnswer')}</p>
              <p className="text-lg font-medium text-green-500">{card.back}</p>
              <DiffHighlight userAnswer={answer} correctAnswer={card.back} />
            </div>
          )}

          <Button onClick={handleNext} className="w-full">
            {t('submit')}
          </Button>
        </div>
      )}
    </div>
  )
}

function DiffHighlight({
  userAnswer,
  correctAnswer,
}: {
  userAnswer: string
  correctAnswer: string
}) {
  const userChars = userAnswer.toLowerCase().split('')
  const correctChars = correctAnswer.toLowerCase().split('')
  const maxLen = Math.max(userChars.length, correctChars.length)

  return (
    <p className="font-mono text-sm">
      {Array.from({ length: maxLen }).map((_, i) => {
        const userChar = userChars[i] ?? ''
        const correctChar = correctChars[i] ?? ''
        const isMatch = userChar === correctChar

        return (
          <span
            key={i}
            className={isMatch ? 'text-green-500' : 'text-red-500 bg-red-100 dark:bg-red-900/30'}
          >
            {userChars[i] ?? '_'}
          </span>
        )
      })}
    </p>
  )
}

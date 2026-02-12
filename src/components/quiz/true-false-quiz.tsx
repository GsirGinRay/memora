'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Card as CardType } from '@/types/database'

interface TrueFalseQuizProps {
  card: CardType
  allCards: CardType[]
  onAnswer: (userAnswer: string, isCorrect: boolean) => void
}

export function TrueFalseQuiz({
  card,
  allCards,
  onAnswer,
}: TrueFalseQuizProps) {
  const t = useTranslations('quiz')
  const [selected, setSelected] = useState<boolean | null>(null)
  const [submitted, setSubmitted] = useState(false)

  // 50% chance of showing correct answer, 50% wrong
  const { displayedAnswer, isStatementTrue } = useMemo(() => {
    const showCorrect = Math.random() > 0.5
    if (showCorrect) {
      return { displayedAnswer: card.back, isStatementTrue: true }
    }
    const wrongAnswers = allCards
      .filter((c) => c.id !== card.id && c.back !== card.back)
      .map((c) => c.back)

    if (wrongAnswers.length === 0) {
      return { displayedAnswer: card.back, isStatementTrue: true }
    }

    const randomWrong = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)]
    return { displayedAnswer: randomWrong, isStatementTrue: false }
  }, [card, allCards])

  useEffect(() => {
    setSelected(null)
    setSubmitted(false)
  }, [card.id])

  const handleSelect = (value: boolean) => {
    if (submitted) return
    setSelected(value)
    setSubmitted(true)
  }

  const isCorrect = selected === isStatementTrue

  return (
    <div className="space-y-6 w-full max-w-lg mx-auto">
      <Card>
        <CardContent className="text-center p-8 space-y-4">
          <p className="text-xl">{card.front}</p>
          <p className="text-lg text-muted-foreground">=</p>
          <p className="text-xl font-medium">{displayedAnswer}</p>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button
          variant="outline"
          className={cn(
            'flex-1 h-14 text-lg',
            submitted && isStatementTrue && 'border-green-500 bg-green-50 dark:bg-green-950',
            submitted && selected === true && !isStatementTrue && 'border-red-500 bg-red-50 dark:bg-red-950'
          )}
          onClick={() => handleSelect(true)}
          disabled={submitted}
        >
          {t('true')}
          {submitted && isStatementTrue && <CheckCircle2 className="ml-2 h-5 w-5 text-green-500" />}
        </Button>

        <Button
          variant="outline"
          className={cn(
            'flex-1 h-14 text-lg',
            submitted && !isStatementTrue && 'border-green-500 bg-green-50 dark:bg-green-950',
            submitted && selected === false && isStatementTrue && 'border-red-500 bg-red-50 dark:bg-red-950'
          )}
          onClick={() => handleSelect(false)}
          disabled={submitted}
        >
          {t('false')}
          {submitted && !isStatementTrue && <CheckCircle2 className="ml-2 h-5 w-5 text-green-500" />}
        </Button>
      </div>

      {submitted && !isCorrect && (
        <p className="text-center text-sm text-muted-foreground">
          {t('correctAnswer')}: <span className="font-medium text-foreground">{card.back}</span>
        </p>
      )}

      {submitted && (
        <Button
          onClick={() => onAnswer(String(selected), isCorrect)}
          className="w-full"
        >
          {t('submit')}
        </Button>
      )}
    </div>
  )
}

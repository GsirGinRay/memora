'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, XCircle } from 'lucide-react'
import { TTSButton } from '@/components/shared/tts-button'
import { shuffleArray } from '@/hooks/use-quiz'
import { cn } from '@/lib/utils'
import type { Card as CardType } from '@/types/database'

interface MultipleChoiceQuizProps {
  card: CardType
  allCards: CardType[]
  onAnswer: (userAnswer: string, isCorrect: boolean) => void
}

export function MultipleChoiceQuiz({
  card,
  allCards,
  onAnswer,
}: MultipleChoiceQuizProps) {
  const t = useTranslations('quiz')
  const [selected, setSelected] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const options = useMemo(() => {
    const distractors = allCards
      .filter((c) => c.id !== card.id && c.back !== card.back)
      .map((c) => c.back)

    const shuffledDistractors = shuffleArray(distractors).slice(0, 3)
    return shuffleArray([card.back, ...shuffledDistractors])
  }, [card, allCards])

  useEffect(() => {
    setSelected(null)
    setSubmitted(false)
  }, [card.id])

  const handleSelect = (option: string) => {
    if (submitted) return
    setSelected(option)
    setSubmitted(true)
  }

  const isCorrect = selected === card.back

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

      <div className="space-y-2">
        {options.map((option, i) => {
          const isThis = option === selected
          const isAnswer = option === card.back

          return (
            <Button
              key={i}
              variant="outline"
              className={cn(
                'w-full justify-start text-left h-auto py-3 px-4',
                submitted && isAnswer && 'border-green-500 bg-green-50 dark:bg-green-950',
                submitted && isThis && !isAnswer && 'border-red-500 bg-red-50 dark:bg-red-950'
              )}
              onClick={() => handleSelect(option)}
              disabled={submitted}
            >
              <span className="mr-2 font-medium text-muted-foreground">
                {String.fromCharCode(65 + i)}.
              </span>
              {option}
              {submitted && isAnswer && (
                <CheckCircle2 className="ml-auto h-4 w-4 text-green-500" />
              )}
              {submitted && isThis && !isAnswer && (
                <XCircle className="ml-auto h-4 w-4 text-red-500" />
              )}
            </Button>
          )
        })}
      </div>

      {submitted && (
        <Button
          onClick={() => onAnswer(selected ?? '', isCorrect)}
          className="w-full"
        >
          {t('submit')}
        </Button>
      )}
    </div>
  )
}

'use client'

import { useState, useMemo, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { shuffleArray } from '@/hooks/use-quiz'
import type { Card as CardType } from '@/types/database'

interface MatchingQuizProps {
  cards: CardType[]
  onComplete: (correctCount: number, totalCount: number) => void
}

interface MatchPair {
  cardId: string
  front: string
  back: string
}

export function MatchingQuiz({ cards, onComplete }: MatchingQuizProps) {
  const t = useTranslations('quiz')
  const pairs: MatchPair[] = useMemo(
    () =>
      cards.slice(0, 6).map((c) => ({
        cardId: c.id,
        front: c.front,
        back: c.back,
      })),
    [cards]
  )

  const shuffledFronts = useMemo(() => shuffleArray(pairs), [pairs])
  const shuffledBacks = useMemo(() => shuffleArray(pairs), [pairs])

  const [selectedFront, setSelectedFront] = useState<string | null>(null)
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [wrong, setWrong] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState(0)

  useEffect(() => {
    if (matched.size === pairs.length && pairs.length > 0) {
      onComplete(correctCount, pairs.length)
    }
  }, [matched.size, pairs.length, correctCount, onComplete])

  const handleFrontClick = (cardId: string) => {
    if (matched.has(cardId)) return
    setSelectedFront(cardId)
    setWrong(null)
  }

  const handleBackClick = (cardId: string) => {
    if (matched.has(cardId) || !selectedFront) return

    if (selectedFront === cardId) {
      setMatched((prev) => new Set([...prev, cardId]))
      setCorrectCount((prev) => prev + 1)
      setSelectedFront(null)
    } else {
      setWrong(cardId)
      setTimeout(() => {
        setWrong(null)
        setSelectedFront(null)
      }, 800)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          {shuffledFronts.map((pair) => (
            <Button
              key={pair.cardId}
              variant="outline"
              className={cn(
                'w-full h-auto py-3 text-left justify-start',
                matched.has(pair.cardId) && 'opacity-50 bg-green-50 dark:bg-green-950 border-green-500',
                selectedFront === pair.cardId && !matched.has(pair.cardId) && 'border-primary bg-primary/10'
              )}
              onClick={() => handleFrontClick(pair.cardId)}
              disabled={matched.has(pair.cardId)}
            >
              {pair.front}
            </Button>
          ))}
        </div>

        <div className="space-y-2">
          {shuffledBacks.map((pair) => (
            <Button
              key={pair.cardId}
              variant="outline"
              className={cn(
                'w-full h-auto py-3 text-left justify-start',
                matched.has(pair.cardId) && 'opacity-50 bg-green-50 dark:bg-green-950 border-green-500',
                wrong === pair.cardId && 'border-red-500 bg-red-50 dark:bg-red-950'
              )}
              onClick={() => handleBackClick(pair.cardId)}
              disabled={matched.has(pair.cardId) || !selectedFront}
            >
              {pair.back}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

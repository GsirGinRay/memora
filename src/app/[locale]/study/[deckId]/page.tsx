'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Flashcard } from '@/components/study/flashcard'
import { RatingButtons } from '@/components/study/rating-buttons'
import { StudyComplete } from '@/components/study/study-complete'
import { useStudyQueue, useSubmitReview, getSchedulingOptions } from '@/hooks/use-study'
import type { Rating } from '@/types/database'

export default function StudyPage() {
  const t = useTranslations('study')
  const tCommon = useTranslations('common')
  const params = useParams()
  const deckId = params.deckId as string

  const { data: queue, isLoading } = useStudyQueue(deckId)
  const submitReview = useSubmitReview()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [cardsStudied, setCardsStudied] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [sessionStart] = useState(() => Date.now())
  const cardStartRef = useRef(Date.now())

  const currentStudyCard = queue?.[currentIndex]
  const totalCards = queue?.length ?? 0
  const isComplete = !isLoading && (!queue || queue.length === 0 || currentIndex >= totalCards)

  const options = currentStudyCard
    ? getSchedulingOptions(currentStudyCard.scheduling)
    : []

  const handleFlip = useCallback(() => {
    setFlipped(true)
  }, [])

  const handleRate = useCallback(
    (rating: Rating) => {
      if (!currentStudyCard) return

      const durationMs = Date.now() - cardStartRef.current

      submitReview.mutate({
        scheduling: currentStudyCard.scheduling,
        rating,
        durationMs,
      })

      setCardsStudied((prev) => prev + 1)
      if (rating >= 3) {
        setCorrectCount((prev) => prev + 1)
      }

      setFlipped(false)
      setCurrentIndex((prev) => prev + 1)
      cardStartRef.current = Date.now()
    },
    [currentStudyCard, submitReview]
  )

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if (e.key === ' ') {
        e.preventDefault()
        if (!flipped) {
          handleFlip()
        }
      } else if (flipped && ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault()
        handleRate(parseInt(e.key) as Rating)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [flipped, handleFlip, handleRate])

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">{tCommon('loading')}</p>
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className="p-4 md:p-6">
        {cardsStudied > 0 ? (
          <StudyComplete
            cardsStudied={cardsStudied}
            correctCount={correctCount}
            totalTime={Date.now() - sessionStart}
            deckId={deckId}
          />
        ) : (
          <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-muted-foreground text-lg">{t('noCards')}</p>
          </div>
        )}
      </div>
    )
  }

  const progress = totalCards > 0 ? (currentIndex / totalCards) * 100 : 0

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto">
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            {currentIndex + 1} / {totalCards}
          </span>
          <span>
            {cardsStudied} {t('cardsStudied')}
          </span>
        </div>
        <Progress value={progress} />
      </div>

      {currentStudyCard && (
        <>
          <Flashcard
            card={currentStudyCard.card}
            flipped={flipped}
            onFlip={handleFlip}
          />

          {!flipped ? (
            <div className="flex justify-center">
              <Button size="lg" onClick={handleFlip} className="px-12">
                {t('showAnswer')}
              </Button>
            </div>
          ) : (
            <RatingButtons
              options={options}
              onRate={handleRate}
              disabled={submitReview.isPending}
            />
          )}
        </>
      )}
    </div>
  )
}

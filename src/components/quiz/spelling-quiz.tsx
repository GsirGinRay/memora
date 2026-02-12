'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Volume2, CheckCircle2, XCircle } from 'lucide-react'
import { speak, isWebSpeechSupported } from '@/lib/tts/speech'
import { checkAnswer } from '@/hooks/use-quiz'
import type { Card as CardType } from '@/types/database'

interface SpellingQuizProps {
  card: CardType
  onAnswer: (userAnswer: string, isCorrect: boolean) => void
}

export function SpellingQuiz({ card, onAnswer }: SpellingQuizProps) {
  const t = useTranslations('quiz')
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setAnswer('')
    setSubmitted(false)
    inputRef.current?.focus()
    // Auto-play TTS on new card
    if (isWebSpeechSupported()) {
      speak(card.back)
    }
  }, [card.id, card.back])

  const handlePlayAudio = () => {
    speak(card.back)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!answer.trim() || submitted) return

    const correct = checkAnswer(answer, card.back)
    setIsCorrect(correct)
    setSubmitted(true)
  }

  return (
    <div className="space-y-6 w-full max-w-lg mx-auto">
      <Card>
        <CardContent className="text-center p-8 space-y-4">
          <p className="text-muted-foreground text-sm">{card.front}</p>
          <Button
            variant="outline"
            size="lg"
            onClick={handlePlayAudio}
            className="gap-2"
          >
            <Volume2 className="h-6 w-6" />
            Play
          </Button>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          ref={inputRef}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type what you hear..."
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
            <p className="text-center">
              <span className="text-sm text-muted-foreground">{t('correctAnswer')}: </span>
              <span className="font-medium text-green-500">{card.back}</span>
            </p>
          )}

          <Button onClick={() => onAnswer(answer, isCorrect)} className="w-full">
            {t('submit')}
          </Button>
        </div>
      )}
    </div>
  )
}

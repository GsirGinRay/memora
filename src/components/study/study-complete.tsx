'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/routing'
import { CheckCircle2 } from 'lucide-react'

interface StudyCompleteProps {
  cardsStudied: number
  correctCount: number
  totalTime: number // in ms
  deckId: string
}

export function StudyComplete({
  cardsStudied,
  correctCount,
  totalTime,
  deckId,
}: StudyCompleteProps) {
  const t = useTranslations('study')
  const accuracy =
    cardsStudied > 0
      ? Math.round((correctCount / cardsStudied) * 100)
      : 0
  const minutes = Math.round(totalTime / 60000)

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">{t('complete')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-bold">{cardsStudied}</p>
              <p className="text-sm text-muted-foreground">
                {t('cardsStudied')}
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold">{accuracy}%</p>
              <p className="text-sm text-muted-foreground">{t('accuracy')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{minutes}</p>
              <p className="text-sm text-muted-foreground">
                {t('timeSpent')} ({t('minutes')})
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Link href="/decks">
              <Button variant="outline">{t('backToDecks')}</Button>
            </Link>
            <Link href={`/quiz/${deckId}`}>
              <Button>{t('startQuiz')}</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/routing'
import { Trophy, RotateCcw } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface QuizAnswer {
  cardFront: string
  userAnswer: string
  correctAnswer: string
  isCorrect: boolean
}

interface QuizResultProps {
  totalQuestions: number
  correctCount: number
  answers: QuizAnswer[]
  deckId: string
  onRetry: () => void
}

export function QuizResult({
  totalQuestions,
  correctCount,
  answers,
  deckId,
  onRetry,
}: QuizResultProps) {
  const t = useTranslations('quiz')
  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0
  const wrongAnswers = answers.filter((a) => !a.isCorrect)

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <Card>
        <CardHeader className="text-center">
          <Trophy className="h-12 w-12 mx-auto text-yellow-500 mb-2" />
          <CardTitle className="text-2xl">{t('result')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-4xl font-bold">{score}%</p>
            <p className="text-muted-foreground">
              {correctCount} / {totalQuestions}
            </p>
          </div>
          <Progress value={score} />
        </CardContent>
      </Card>

      {wrongAnswers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('reviewWrong')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {wrongAnswers.map((answer, i) => (
              <div key={i} className="border rounded-lg p-3 space-y-1">
                <p className="font-medium">{answer.cardFront}</p>
                <p className="text-sm text-red-500">
                  {t('yourAnswer')}: {answer.userAnswer || '(no answer)'}
                </p>
                <p className="text-sm text-green-500">
                  {t('correctAnswer')}: {answer.correctAnswer}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onRetry} className="flex-1 gap-2">
          <RotateCcw className="h-4 w-4" />
          {t('tryAgain')}
        </Button>
        <Link href={`/decks/${deckId}`} className="flex-1">
          <Button className="w-full">
            {t('reviewWrong')}
          </Button>
        </Link>
      </div>
    </div>
  )
}

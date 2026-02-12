'use client'

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useCards } from '@/hooks/use-cards'
import {
  useCreateQuizSession,
  useSubmitQuizAnswer,
  useFinishQuizSession,
  shuffleArray,
} from '@/hooks/use-quiz'
import { TypingQuiz } from '@/components/quiz/typing-quiz'
import { MultipleChoiceQuiz } from '@/components/quiz/multiple-choice-quiz'
import { TrueFalseQuiz } from '@/components/quiz/true-false-quiz'
import { MatchingQuiz } from '@/components/quiz/matching-quiz'
import { SpellingQuiz } from '@/components/quiz/spelling-quiz'
import { QuizResult } from '@/components/quiz/quiz-result'
import type { QuizType, Card as CardType } from '@/types/database'

interface QuizAnswer {
  cardFront: string
  userAnswer: string
  correctAnswer: string
  isCorrect: boolean
}

export default function QuizPage() {
  const t = useTranslations('quiz')
  const tCommon = useTranslations('common')
  const params = useParams()
  const deckId = params.deckId as string

  const { data: cards, isLoading } = useCards(deckId)
  const createSession = useCreateQuizSession()
  const submitAnswer = useSubmitQuizAnswer()
  const finishSession = useFinishQuizSession()

  const [quizType, setQuizType] = useState<QuizType>('typing')
  const [questionCount, setQuestionCount] = useState(10)
  const [started, setStarted] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [quizCards, setQuizCards] = useState<CardType[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswer[]>([])
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)

  const handleStart = async () => {
    if (!cards || cards.length === 0) return

    const shuffled = shuffleArray(cards)
    const selected = shuffled.slice(0, questionCount)

    const session = await createSession.mutateAsync({
      deckId,
      quizType,
      totalQuestions: selected.length,
    })

    setSessionId(session.id as string)
    setQuizCards(selected)
    setCurrentIndex(0)
    setAnswers([])
    setCorrectCount(0)
    setFinished(false)
    setStarted(true)
  }

  const handleAnswer = useCallback(
    (userAnswer: string, isCorrect: boolean) => {
      const card = quizCards[currentIndex]
      if (!card || !sessionId) return

      submitAnswer.mutate({
        sessionId,
        cardId: card.id,
        userAnswer,
        correctAnswer: card.back,
        isCorrect,
      })

      const newAnswer: QuizAnswer = {
        cardFront: card.front,
        userAnswer,
        correctAnswer: card.back,
        isCorrect,
      }

      const newAnswers = [...answers, newAnswer]
      const newCorrectCount = correctCount + (isCorrect ? 1 : 0)
      setAnswers(newAnswers)
      setCorrectCount(newCorrectCount)

      if (currentIndex + 1 >= quizCards.length) {
        finishSession.mutate({
          sessionId,
          correctCount: newCorrectCount,
          totalQuestions: quizCards.length,
        })
        setFinished(true)
      } else {
        setCurrentIndex((prev) => prev + 1)
      }
    },
    [quizCards, currentIndex, sessionId, answers, correctCount, submitAnswer, finishSession]
  )

  const handleMatchingComplete = useCallback(
    (correct: number, total: number) => {
      if (!sessionId) return
      finishSession.mutate({
        sessionId,
        correctCount: correct,
        totalQuestions: total,
      })
      setCorrectCount(correct)
      setFinished(true)
      setAnswers([])
    },
    [sessionId, finishSession]
  )

  const handleRetry = () => {
    setStarted(false)
    setFinished(false)
  }

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <p className="text-muted-foreground">{tCommon('loading')}</p>
      </div>
    )
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="p-4 md:p-6 text-center py-12">
        <p className="text-muted-foreground">{tCommon('noData')}</p>
      </div>
    )
  }

  // Quiz result
  if (finished) {
    return (
      <div className="p-4 md:p-6">
        <QuizResult
          totalQuestions={quizCards.length}
          correctCount={correctCount}
          answers={answers}
          deckId={deckId}
          onRetry={handleRetry}
        />
      </div>
    )
  }

  // Quiz setup
  if (!started) {
    return (
      <div className="p-4 md:p-6 flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t('startQuiz')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>{t('quizType')}</Label>
              <Select
                value={quizType}
                onValueChange={(v) => setQuizType(v as QuizType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="typing">{t('typing')}</SelectItem>
                  <SelectItem value="multiple_choice">{t('multipleChoice')}</SelectItem>
                  <SelectItem value="true_false">{t('trueFalse')}</SelectItem>
                  <SelectItem value="matching">{t('matching')}</SelectItem>
                  <SelectItem value="spelling">{t('spelling')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('questionCount')}</Label>
              <Select
                value={String(questionCount)}
                onValueChange={(v) => setQuestionCount(parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleStart} className="w-full" disabled={createSession.isPending}>
              {t('startQuiz')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Active quiz
  const currentCard = quizCards[currentIndex]
  const progress = ((currentIndex) / quizCards.length) * 100

  return (
    <div className="p-4 md:p-6 space-y-6">
      {quizType !== 'matching' && (
        <div className="space-y-2 max-w-lg mx-auto">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              {currentIndex + 1} / {quizCards.length}
            </span>
            <span>{t('score')}: {correctCount}</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      {quizType === 'typing' && currentCard && (
        <TypingQuiz card={currentCard} onAnswer={handleAnswer} />
      )}

      {quizType === 'multiple_choice' && currentCard && (
        <MultipleChoiceQuiz
          card={currentCard}
          allCards={cards}
          onAnswer={handleAnswer}
        />
      )}

      {quizType === 'true_false' && currentCard && (
        <TrueFalseQuiz
          card={currentCard}
          allCards={cards}
          onAnswer={handleAnswer}
        />
      )}

      {quizType === 'matching' && (
        <MatchingQuiz
          cards={quizCards}
          onComplete={handleMatchingComplete}
        />
      )}

      {quizType === 'spelling' && currentCard && (
        <SpellingQuiz card={currentCard} onAnswer={handleAnswer} />
      )}
    </div>
  )
}

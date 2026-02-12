'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchJson } from '@/lib/api/fetch'
import type { QuizType } from '@/types/database'

interface CreateSessionInput {
  deckId: string
  quizType: QuizType
  totalQuestions: number
}

export function useCreateQuizSession() {
  return useMutation({
    mutationFn: ({ deckId, quizType, totalQuestions }: CreateSessionInput) =>
      fetchJson<Record<string, unknown>>('/api/quiz/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deckId, quizType, totalQuestions }),
      }),
  })
}

interface SubmitAnswerInput {
  sessionId: string
  cardId: string
  userAnswer: string
  correctAnswer: string
  isCorrect: boolean
  responseTimeMs?: number
}

export function useSubmitQuizAnswer() {
  return useMutation({
    mutationFn: (input: SubmitAnswerInput) =>
      fetchJson<Record<string, unknown>>('/api/quiz/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      }),
  })
}

export function useFinishQuizSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      sessionId,
      correctCount,
      totalQuestions,
    }: {
      sessionId: string
      correctCount: number
      totalQuestions: number
    }) =>
      fetchJson<Record<string, unknown>>(`/api/quiz/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correctCount, totalQuestions }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-sessions'] })
    },
  })
}

export function normalizeAnswer(answer: string): string {
  return answer.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function checkAnswer(userAnswer: string, correctAnswer: string): boolean {
  return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer)
}

export function generateDistractors(
  correctAnswer: string,
  allAnswers: string[],
  count: number = 3
): string[] {
  const candidates = allAnswers.filter(
    (a) => normalizeAnswer(a) !== normalizeAnswer(correctAnswer)
  )

  const shuffled = [...candidates].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

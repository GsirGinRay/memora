import { NextResponse } from 'next/server'
import { db } from '@/lib/db/drizzle'
import { quizAnswers } from '@/lib/db/schema'
import { requireAuth } from '@/lib/auth/get-session'

export async function POST(request: Request) {
  try {
    await requireAuth()
    const body = await request.json()

    const [answer] = await db
      .insert(quizAnswers)
      .values({
        sessionId: body.sessionId,
        cardId: body.cardId,
        userAnswer: body.userAnswer,
        correctAnswer: body.correctAnswer,
        isCorrect: body.isCorrect,
        responseTimeMs: body.responseTimeMs ?? null,
      })
      .returning()

    return NextResponse.json(answer, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to submit answer' }, { status: 500 })
  }
}

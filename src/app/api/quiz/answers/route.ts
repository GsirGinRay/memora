import { NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { db } from '@/lib/db/drizzle'
import { quizAnswers, quizSessions } from '@/lib/db/schema'
import { requireAuth } from '@/lib/auth/get-session'

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    // Verify session belongs to current user
    const [session] = await db
      .select({ id: quizSessions.id })
      .from(quizSessions)
      .where(
        and(
          eq(quizSessions.id, body.sessionId),
          eq(quizSessions.userId, user.id)
        )
      )

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

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

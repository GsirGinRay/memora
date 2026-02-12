import { NextResponse } from 'next/server'
import { db } from '@/lib/db/drizzle'
import { quizSessions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth/get-session'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    await requireAuth()
    const { sessionId } = await params
    const body = await request.json()

    const score = body.totalQuestions > 0
      ? (body.correctCount / body.totalQuestions) * 100
      : 0

    const [session] = await db
      .update(quizSessions)
      .set({
        correctCount: body.correctCount,
        score,
        finishedAt: new Date().toISOString(),
      })
      .where(eq(quizSessions.id, sessionId))
      .returning()

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    return NextResponse.json(session)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to finish quiz session' }, { status: 500 })
  }
}

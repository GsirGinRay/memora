import { NextResponse } from 'next/server'
import { db } from '@/lib/db/drizzle'
import { quizSessions } from '@/lib/db/schema'
import { requireAuth } from '@/lib/auth/get-session'

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const [session] = await db
      .insert(quizSessions)
      .values({
        userId: user.id,
        deckId: body.deckId,
        quizType: body.quizType,
        totalQuestions: body.totalQuestions,
      })
      .returning()

    return NextResponse.json(session, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to create quiz session' }, { status: 500 })
  }
}

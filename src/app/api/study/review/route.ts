import { NextResponse } from 'next/server'
import { db } from '@/lib/db/drizzle'
import { cardScheduling, reviewLogs } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth/get-session'
import { scheduleCard } from '@/lib/fsrs/scheduler'
import type { CardScheduling, Rating } from '@/types/database'

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const { scheduling, rating, durationMs } = body as {
      scheduling: CardScheduling
      rating: Rating
      durationMs: number
    }

    const now = new Date()
    const { updatedScheduling } = scheduleCard(scheduling, rating, now)

    await db
      .update(cardScheduling)
      .set({
        ...updatedScheduling,
        updatedAt: now.toISOString(),
      })
      .where(eq(cardScheduling.id, scheduling.id))

    await db.insert(reviewLogs).values({
      cardId: scheduling.cardId,
      userId: user.id,
      rating,
      state: (updatedScheduling.state ?? scheduling.state) as string,
      due: (updatedScheduling.due ?? scheduling.due) as string,
      stability: updatedScheduling.stability ?? scheduling.stability,
      difficulty: updatedScheduling.difficulty ?? scheduling.difficulty,
      elapsedDays: updatedScheduling.elapsedDays ?? scheduling.elapsedDays,
      scheduledDays: updatedScheduling.scheduledDays ?? scheduling.scheduledDays,
      reviewDurationMs: durationMs,
      reviewedAt: now.toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }
}

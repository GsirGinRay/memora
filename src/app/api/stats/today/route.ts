import { NextResponse } from 'next/server'
import { db } from '@/lib/db/drizzle'
import { reviewLogs } from '@/lib/db/schema'
import { eq, and, gte } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth/get-session'
import { startOfDay } from 'date-fns'

export async function GET() {
  try {
    const user = await requireAuth()
    const today = startOfDay(new Date()).toISOString()

    const reviews = await db
      .select({ rating: reviewLogs.rating })
      .from(reviewLogs)
      .where(
        and(
          eq(reviewLogs.userId, user.id),
          gte(reviewLogs.reviewedAt, today)
        )
      )

    const correctCount = reviews.filter((r) => r.rating >= 3).length

    return NextResponse.json({
      totalReviews: reviews.length,
      correctCount,
      accuracy: reviews.length > 0
        ? Math.round((correctCount / reviews.length) * 100)
        : 0,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch today stats' }, { status: 500 })
  }
}

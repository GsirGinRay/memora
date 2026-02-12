import { NextResponse } from 'next/server'
import { db } from '@/lib/db/drizzle'
import { reviewLogs } from '@/lib/db/schema'
import { eq, and, gte, asc } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth/get-session'
import { subDays, format } from 'date-fns'

export async function GET(request: Request) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') ?? '30', 10)

    const since = subDays(new Date(), days).toISOString()

    const data = await db
      .select({
        reviewedAt: reviewLogs.reviewedAt,
        rating: reviewLogs.rating,
      })
      .from(reviewLogs)
      .where(
        and(
          eq(reviewLogs.userId, user.id),
          gte(reviewLogs.reviewedAt, since)
        )
      )
      .orderBy(asc(reviewLogs.reviewedAt))

    const dailyMap = new Map<string, { count: number; correctCount: number }>()

    for (let i = 0; i < days; i++) {
      const date = format(subDays(new Date(), days - 1 - i), 'MM/dd')
      dailyMap.set(date, { count: 0, correctCount: 0 })
    }

    for (const log of data) {
      const date = format(new Date(log.reviewedAt), 'MM/dd')
      const existing = dailyMap.get(date)
      if (existing) {
        existing.count++
        if (log.rating >= 3) existing.correctCount++
      }
    }

    const result = Array.from(dailyMap.entries()).map(([date, stats]) => ({
      date,
      ...stats,
    }))

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch trend' }, { status: 500 })
  }
}

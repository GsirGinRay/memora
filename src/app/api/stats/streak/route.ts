import { NextResponse } from 'next/server'
import { db } from '@/lib/db/drizzle'
import { reviewLogs } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth/get-session'
import { format, subDays } from 'date-fns'

export async function GET() {
  try {
    const user = await requireAuth()

    const data = await db
      .select({ reviewedAt: reviewLogs.reviewedAt })
      .from(reviewLogs)
      .where(eq(reviewLogs.userId, user.id))
      .orderBy(desc(reviewLogs.reviewedAt))
      .limit(365)

    if (data.length === 0) {
      return NextResponse.json({ streak: 0 })
    }

    const reviewDays = new Set(
      data.map((r) => format(new Date(r.reviewedAt), 'yyyy-MM-dd'))
    )

    let streak = 0
    let checkDate = new Date()

    if (!reviewDays.has(format(checkDate, 'yyyy-MM-dd'))) {
      checkDate = subDays(checkDate, 1)
    }

    while (reviewDays.has(format(checkDate, 'yyyy-MM-dd'))) {
      streak++
      checkDate = subDays(checkDate, 1)
    }

    return NextResponse.json({ streak })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch streak' }, { status: 500 })
  }
}

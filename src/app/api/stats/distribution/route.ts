import { NextResponse } from 'next/server'
import { db } from '@/lib/db/drizzle'
import { cardScheduling } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth/get-session'

export async function GET() {
  try {
    const user = await requireAuth()

    const data = await db
      .select({ state: cardScheduling.state })
      .from(cardScheduling)
      .where(eq(cardScheduling.userId, user.id))

    const counts = new Map<string, number>()
    for (const item of data) {
      counts.set(item.state, (counts.get(item.state) ?? 0) + 1)
    }

    const result = Array.from(counts.entries()).map(([state, count]) => ({
      state,
      count,
    }))

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch distribution' }, { status: 500 })
  }
}

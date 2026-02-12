import { NextResponse } from 'next/server'
import { db } from '@/lib/db/drizzle'
import { cards, cardScheduling } from '@/lib/db/schema'
import { eq, and, lte, asc } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth/get-session'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const user = await requireAuth()
    const { deckId } = await params
    const now = new Date().toISOString()

    const result = await db
      .select({
        scheduling: cardScheduling,
        card: cards,
      })
      .from(cardScheduling)
      .innerJoin(cards, eq(cardScheduling.cardId, cards.id))
      .where(
        and(
          eq(cardScheduling.userId, user.id),
          eq(cards.deckId, deckId),
          lte(cardScheduling.due, now)
        )
      )
      .orderBy(asc(cardScheduling.due))
      .limit(50)

    const studyCards = result.map((row) => ({
      card: row.card,
      scheduling: row.scheduling,
    }))

    return NextResponse.json(studyCards)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch study queue' }, { status: 500 })
  }
}

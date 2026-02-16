import { NextResponse } from 'next/server'
import { db } from '@/lib/db/drizzle'
import { decks, cards, cardScheduling } from '@/lib/db/schema'
import { eq, desc, sql } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth/get-session'

export async function GET() {
  try {
    const user = await requireAuth()

    const [deckRows, counts] = await Promise.all([
      db
        .select()
        .from(decks)
        .where(eq(decks.userId, user.id))
        .orderBy(desc(decks.updatedAt)),
      db
        .select({
          deckId: cards.deckId,
          cardCount: sql<number>`count(*)::int`,
          newCount: sql<number>`count(*) filter (where ${cardScheduling.state} = 'new')::int`,
          dueCount: sql<number>`count(*) filter (where ${cardScheduling.due} <= now() and ${cardScheduling.state} != 'new')::int`,
        })
        .from(cards)
        .leftJoin(cardScheduling, eq(cardScheduling.cardId, cards.id))
        .where(eq(cards.userId, user.id))
        .groupBy(cards.deckId),
    ])

    const countMap = new Map(
      counts.map((c) => [c.deckId, c])
    )

    const result = deckRows.map((deck) => ({
      ...deck,
      cardCount: countMap.get(deck.id)?.cardCount ?? 0,
      newCount: countMap.get(deck.id)?.newCount ?? 0,
      dueCount: countMap.get(deck.id)?.dueCount ?? 0,
    }))

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch decks' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const [deck] = await db
      .insert(decks)
      .values({
        userId: user.id,
        name: body.name,
        description: body.description ?? null,
        color: body.color ?? '#6366f1',
      })
      .returning()

    return NextResponse.json(deck, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to create deck' }, { status: 500 })
  }
}

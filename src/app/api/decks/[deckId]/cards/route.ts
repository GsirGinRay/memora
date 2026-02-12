import { NextResponse } from 'next/server'
import { db } from '@/lib/db/drizzle'
import { cards, cardScheduling } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth/get-session'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const user = await requireAuth()
    const { deckId } = await params

    const result = await db
      .select()
      .from(cards)
      .where(and(eq(cards.deckId, deckId), eq(cards.userId, user.id)))
      .orderBy(desc(cards.createdAt))

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const user = await requireAuth()
    const { deckId } = await params
    const body = await request.json()

    const [card] = await db
      .insert(cards)
      .values({
        deckId,
        userId: user.id,
        cardType: body.card_type ?? 'basic',
        front: body.front,
        back: body.back,
        hint: body.hint ?? null,
        tags: body.tags ?? [],
        clozeData: body.cloze_data ?? null,
        occlusionData: body.occlusion_data ?? null,
        mediaUrls: body.media_urls ?? [],
      })
      .returning()

    await db.insert(cardScheduling).values({
      cardId: card.id,
      userId: user.id,
      due: new Date().toISOString(),
      stability: 0,
      difficulty: 0,
      elapsedDays: 0,
      scheduledDays: 0,
      reps: 0,
      lapses: 0,
      state: 'new',
    })

    return NextResponse.json(card, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to create card' }, { status: 500 })
  }
}

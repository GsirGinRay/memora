import { NextResponse } from 'next/server'
import { db } from '@/lib/db/drizzle'
import { cards } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth/get-session'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {
    const user = await requireAuth()
    const { cardId } = await params
    const body = await request.json()

    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    }

    if (body.front !== undefined) updateData.front = body.front
    if (body.back !== undefined) updateData.back = body.back
    if (body.hint !== undefined) updateData.hint = body.hint
    if (body.tags !== undefined) updateData.tags = body.tags
    if (body.card_type !== undefined) updateData.cardType = body.card_type
    if (body.cloze_data !== undefined) updateData.clozeData = body.cloze_data
    if (body.occlusion_data !== undefined) updateData.occlusionData = body.occlusion_data
    if (body.media_urls !== undefined) updateData.mediaUrls = body.media_urls

    const [card] = await db
      .update(cards)
      .set(updateData)
      .where(and(eq(cards.id, cardId), eq(cards.userId, user.id)))
      .returning()

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    return NextResponse.json(card)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to update card' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {
    const user = await requireAuth()
    const { cardId } = await params

    const [card] = await db
      .delete(cards)
      .where(and(eq(cards.id, cardId), eq(cards.userId, user.id)))
      .returning({ id: cards.id })

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to delete card' }, { status: 500 })
  }
}

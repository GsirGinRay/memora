import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db/drizzle'
import { cards } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth/get-session'

const mediaSideSchema = z.object({
  imageUrl: z.string().max(2000).optional(),
  audioUrl: z.string().max(2000).optional(),
}).optional()

const cardMediaSchema = z.object({
  front: mediaSideSchema,
  back: mediaSideSchema,
  tts: z.object({
    enabled: z.boolean(),
    lang: z.enum(['en', 'zh-TW']),
  }).optional(),
}).nullable().optional()

const updateCardSchema = z.object({
  front: z.string().min(1).max(10000).optional(),
  back: z.string().max(10000).optional(),
  hint: z.string().max(1000).nullable().optional(),
  tags: z.array(z.string().max(100)).max(50).optional(),
  card_type: z.enum(['basic', 'cloze', 'image_occlusion', 'audio']).optional(),
  cloze_data: z.any().nullable().optional(),
  occlusion_data: z.any().nullable().optional(),
  media_urls: z.array(z.string().max(2000)).max(20).optional(),
  media: cardMediaSchema,
}).strict()

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {
    const user = await requireAuth()
    const { cardId } = await params
    const raw = await request.json()

    const body = updateCardSchema.parse(raw)

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
    if (body.media !== undefined) updateData.media = body.media

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
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
    }
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

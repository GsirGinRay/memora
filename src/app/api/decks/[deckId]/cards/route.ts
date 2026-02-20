import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db/drizzle'
import { cards, cardScheduling } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
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

const createCardSchema = z.object({
  card_type: z.enum(['basic', 'cloze', 'image_occlusion', 'audio']).default('basic'),
  front: z.string().min(1).max(10000),
  back: z.string().max(10000).default(''),
  hint: z.string().max(1000).nullable().optional(),
  tags: z.array(z.string().max(100)).max(50).default([]),
  media: cardMediaSchema,
  media_urls: z.array(z.string().max(2000)).max(20).default([]),
  cloze_data: z.any().nullable().optional(),
  occlusion_data: z.any().nullable().optional(),
  template_id: z.string().uuid().nullable().optional(),
  field_values: z.record(z.string(), z.string()).nullable().optional(),
})

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
    const raw = await request.json()

    const body = createCardSchema.parse(raw)

    const [card] = await db
      .insert(cards)
      .values({
        deckId,
        userId: user.id,
        cardType: body.card_type,
        front: body.front,
        back: body.back,
        hint: body.hint ?? null,
        tags: body.tags,
        clozeData: body.cloze_data ?? null,
        occlusionData: body.occlusion_data ?? null,
        mediaUrls: body.media_urls,
        media: body.media ?? null,
        templateId: body.template_id ?? null,
        fieldValues: body.field_values ?? null,
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
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const message = error instanceof Error ? error.message : 'Unknown error'
    const cause = error instanceof Error && error.cause ? String(error.cause) : undefined
    return NextResponse.json({ error: `Failed to create card: ${message}`, cause }, { status: 500 })
  }
}

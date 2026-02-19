import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db/drizzle'
import { cardTemplates } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth/get-session'
import { BUILT_IN_TEMPLATES } from '@/lib/templates/built-in'
import type { CardTemplate } from '@/types/card-template'

const blockSchema = z.object({
  id: z.string().min(1).max(50),
  type: z.enum(['text', 'image', 'audio', 'divider']),
  label: z.string().min(1).max(100),
  placeholder: z.string().max(200).optional(),
  required: z.boolean().optional(),
  markdown: z.boolean().optional(),
  autoplay: z.boolean().optional(),
})

const createTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).nullable().optional(),
  front_blocks: z.array(blockSchema).min(1).max(20),
  back_blocks: z.array(blockSchema).max(20),
  tts: z.object({
    enabled: z.boolean(),
    lang: z.enum(['en', 'zh-TW']),
  }).nullable().optional(),
})

export async function GET() {
  try {
    const user = await requireAuth()

    let customMapped: CardTemplate[] = []
    try {
      const custom = await db
        .select()
        .from(cardTemplates)
        .where(eq(cardTemplates.userId, user.id))
        .orderBy(desc(cardTemplates.createdAt))

      customMapped = custom.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description ?? undefined,
        isBuiltIn: false,
        frontBlocks: t.frontBlocks as CardTemplate['frontBlocks'],
        backBlocks: t.backBlocks as CardTemplate['backBlocks'],
        tts: t.tts as CardTemplate['tts'],
      }))
    } catch {
      // card_templates table may not exist yet — gracefully return built-in only
    }

    return NextResponse.json([...BUILT_IN_TEMPLATES, ...customMapped])
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // Even on unexpected errors, return built-in templates
    return NextResponse.json([...BUILT_IN_TEMPLATES])
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const raw = await request.json()
    const body = createTemplateSchema.parse(raw)

    const [template] = await db
      .insert(cardTemplates)
      .values({
        userId: user.id,
        name: body.name,
        description: body.description ?? null,
        frontBlocks: body.front_blocks,
        backBlocks: body.back_blocks,
        tts: body.tts ?? null,
      })
      .returning()

    const result: CardTemplate = {
      id: template.id,
      name: template.name,
      description: template.description ?? undefined,
      isBuiltIn: false,
      frontBlocks: template.frontBlocks as CardTemplate['frontBlocks'],
      backBlocks: template.backBlocks as CardTemplate['backBlocks'],
      tts: template.tts as CardTemplate['tts'],
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}

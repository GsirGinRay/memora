import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db/drizzle'
import { cardTemplates } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth/get-session'
import { isBuiltInTemplateId } from '@/lib/templates/built-in'
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

const updateTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  front_blocks: z.array(blockSchema).min(1).max(20).optional(),
  back_blocks: z.array(blockSchema).max(20).optional(),
  tts: z.object({
    enabled: z.boolean(),
    lang: z.enum(['en', 'zh-TW']),
  }).nullable().optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const user = await requireAuth()
    const { templateId } = await params

    if (isBuiltInTemplateId(templateId)) {
      return NextResponse.json({ error: 'Cannot modify built-in templates' }, { status: 403 })
    }

    const raw = await request.json()
    const body = updateTemplateSchema.parse(raw)

    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    }

    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.front_blocks !== undefined) updateData.frontBlocks = body.front_blocks
    if (body.back_blocks !== undefined) updateData.backBlocks = body.back_blocks
    if (body.tts !== undefined) updateData.tts = body.tts

    const [template] = await db
      .update(cardTemplates)
      .set(updateData)
      .where(and(eq(cardTemplates.id, templateId), eq(cardTemplates.userId, user.id)))
      .returning()

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    const result: CardTemplate = {
      id: template.id,
      name: template.name,
      description: template.description ?? undefined,
      isBuiltIn: false,
      frontBlocks: template.frontBlocks as CardTemplate['frontBlocks'],
      backBlocks: template.backBlocks as CardTemplate['backBlocks'],
      tts: template.tts as CardTemplate['tts'],
    }

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const user = await requireAuth()
    const { templateId } = await params

    if (isBuiltInTemplateId(templateId)) {
      return NextResponse.json({ error: 'Cannot delete built-in templates' }, { status: 403 })
    }

    const [template] = await db
      .delete(cardTemplates)
      .where(and(eq(cardTemplates.id, templateId), eq(cardTemplates.userId, user.id)))
      .returning({ id: cardTemplates.id })

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 })
  }
}

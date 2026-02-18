import { NextResponse } from 'next/server'
import { db } from '@/lib/db/drizzle'
import { cards, cardScheduling } from '@/lib/db/schema'
import { eq, and, gt, asc, sql } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth/get-session'
import type { CustomStudyMode } from '@/types/database'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const user = await requireAuth()
    const { deckId } = await params
    const url = new URL(request.url)
    const modeParam = url.searchParams.get('mode') ?? 'all'
    const validModes: CustomStudyMode[] = ['all', 'failed', 'tags', 'ahead']
    if (!validModes.includes(modeParam as CustomStudyMode)) {
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
    }
    const mode = modeParam as CustomStudyMode
    const tagsParam = url.searchParams.get('tags')
    const now = new Date().toISOString()

    const baseConditions = [
      eq(cards.deckId, deckId),
      eq(cards.userId, user.id),
      eq(cardScheduling.userId, user.id),
    ]

    let modeConditions = baseConditions
    switch (mode) {
      case 'failed':
        modeConditions = [...baseConditions, gt(cardScheduling.lapses, 0)]
        break
      case 'tags': {
        if (tagsParam) {
          const tagList = tagsParam.split(',').map((t) => t.trim()).filter(Boolean)
          if (tagList.length > 0) {
            modeConditions = [
              ...baseConditions,
              sql`${cards.tags} ?| array[${sql.join(tagList.map((t) => sql`${t}`), sql`, `)}]`,
            ]
          }
        }
        break
      }
      case 'ahead':
        modeConditions = [...baseConditions, gt(cardScheduling.due, now)]
        break
    }

    const result = await db
      .select({
        scheduling: cardScheduling,
        card: cards,
      })
      .from(cardScheduling)
      .innerJoin(cards, eq(cardScheduling.cardId, cards.id))
      .where(and(...modeConditions))
      .orderBy(asc(cards.createdAt))
      .limit(200)

    const studyCards = result.map((row) => ({
      card: row.card,
      scheduling: row.scheduling,
    }))

    return NextResponse.json(studyCards)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch custom study queue' }, { status: 500 })
  }
}

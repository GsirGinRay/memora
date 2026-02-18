import { NextResponse } from 'next/server'
import { db } from '@/lib/db/drizzle'
import { cards } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth/get-session'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const user = await requireAuth()
    const { deckId } = await params

    const result = await db
      .select({
        tag: sql<string>`jsonb_array_elements_text(COALESCE(${cards.tags}, '[]'::jsonb))`.as('tag'),
      })
      .from(cards)
      .where(and(eq(cards.deckId, deckId), eq(cards.userId, user.id)))

    const uniqueTags = [...new Set(result.map((r) => r.tag))].sort()

    return NextResponse.json(uniqueTags)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 })
  }
}

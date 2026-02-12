import { NextResponse } from 'next/server'
import { db } from '@/lib/db/drizzle'
import { decks } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth/get-session'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const user = await requireAuth()
    const { deckId } = await params
    const body = await request.json()

    const { name, description, color, isArchived } = body as {
      name?: string
      description?: string
      color?: string
      isArchived?: boolean
    }

    const [deck] = await db
      .update(decks)
      .set({
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(color !== undefined && { color }),
        ...(isArchived !== undefined && { isArchived }),
        updatedAt: new Date().toISOString(),
      })
      .where(and(eq(decks.id, deckId), eq(decks.userId, user.id)))
      .returning()

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 })
    }

    return NextResponse.json(deck)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to update deck' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const user = await requireAuth()
    const { deckId } = await params

    const [deck] = await db
      .delete(decks)
      .where(and(eq(decks.id, deckId), eq(decks.userId, user.id)))
      .returning({ id: decks.id })

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to delete deck' }, { status: 500 })
  }
}

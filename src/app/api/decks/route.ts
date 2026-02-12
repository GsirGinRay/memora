import { NextResponse } from 'next/server'
import { db } from '@/lib/db/drizzle'
import { decks } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth/get-session'

export async function GET() {
  try {
    const user = await requireAuth()

    const result = await db
      .select()
      .from(decks)
      .where(eq(decks.userId, user.id))
      .orderBy(desc(decks.updatedAt))

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

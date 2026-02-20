import { NextResponse } from 'next/server'
import { db } from '@/lib/db/drizzle'
import { sql } from 'drizzle-orm'

export async function GET() {
  const results: string[] = []

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS card_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        front_blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
        back_blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
        tts JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)
    results.push('card_templates table: OK')
  } catch (e) {
    results.push(`card_templates table: ${e instanceof Error ? e.message : 'failed'}`)
  }

  try {
    await db.execute(sql`
      ALTER TABLE cards ADD COLUMN IF NOT EXISTS template_id UUID
    `)
    results.push('cards.template_id column: OK')
  } catch (e) {
    results.push(`cards.template_id: ${e instanceof Error ? e.message : 'failed'}`)
  }

  try {
    await db.execute(sql`
      ALTER TABLE cards ADD COLUMN IF NOT EXISTS field_values JSONB
    `)
    results.push('cards.field_values column: OK')
  } catch (e) {
    results.push(`cards.field_values: ${e instanceof Error ? e.message : 'failed'}`)
  }

  const allOk = results.every((r) => r.endsWith(': OK'))
  return NextResponse.json({ success: allOk, results })
}

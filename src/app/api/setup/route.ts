import { NextResponse } from 'next/server'
import { db } from '@/lib/db/drizzle'
import { sql } from 'drizzle-orm'

export async function GET() {
  const results: string[] = []

  try {
    // Create card_templates table
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

    // Add FK if users table exists
    try {
      await db.execute(sql`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'card_templates_user_id_fkey'
          ) THEN
            ALTER TABLE card_templates
              ADD CONSTRAINT card_templates_user_id_fkey
              FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
          END IF;
        END $$
      `)
      results.push('card_templates FK to users: OK')
    } catch {
      results.push('card_templates FK to users: skipped (users table may not exist)')
    }

    // Add template_id column to cards
    await db.execute(sql`
      ALTER TABLE cards ADD COLUMN IF NOT EXISTS template_id UUID
    `)
    results.push('cards.template_id column: OK')

    // Add FK for template_id
    try {
      await db.execute(sql`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'cards_template_id_fkey'
          ) THEN
            ALTER TABLE cards
              ADD CONSTRAINT cards_template_id_fkey
              FOREIGN KEY (template_id) REFERENCES card_templates(id) ON DELETE SET NULL;
          END IF;
        END $$
      `)
      results.push('cards.template_id FK: OK')
    } catch {
      results.push('cards.template_id FK: skipped')
    }

    // Add field_values column to cards
    await db.execute(sql`
      ALTER TABLE cards ADD COLUMN IF NOT EXISTS field_values JSONB
    `)
    results.push('cards.field_values column: OK')

    return NextResponse.json({ success: true, results })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, results, error: message }, { status: 500 })
  }
}

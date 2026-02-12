import type { ClozeData, ClozeDeletion } from '@/types/database'

const CLOZE_REGEX = /\{\{c(\d+)::([^}]+?)(?:::([^}]*))?\}\}/g

export function parseClozeText(text: string): ClozeData {
  const deletions: ClozeDeletion[] = []
  let match: RegExpExecArray | null

  const regex = new RegExp(CLOZE_REGEX.source, 'g')

  while ((match = regex.exec(text)) !== null) {
    deletions.push({
      index: parseInt(match[1], 10),
      answer: match[2],
      hint: match[3] ?? null,
    })
  }

  return {
    template: text,
    deletions,
  }
}

export function validateClozeText(text: string): boolean {
  const regex = new RegExp(CLOZE_REGEX.source, 'g')
  return regex.test(text)
}

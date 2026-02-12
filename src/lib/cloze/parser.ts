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

export function renderClozeText(
  template: string,
  revealedIndices: Set<number>
): string {
  return template.replace(CLOZE_REGEX, (_match, indexStr, answer, hint) => {
    const index = parseInt(indexStr, 10)
    if (revealedIndices.has(index)) {
      return `<span class="cloze-revealed">${answer}</span>`
    }
    if (hint) {
      return `<span class="cloze-hidden">[${hint}]</span>`
    }
    return `<span class="cloze-hidden">[...]</span>`
  })
}

export function getClozeIndices(text: string): number[] {
  const indices = new Set<number>()
  const regex = new RegExp(CLOZE_REGEX.source, 'g')
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    indices.add(parseInt(match[1], 10))
  }

  return Array.from(indices).sort((a, b) => a - b)
}

export function stripClozeMarkup(text: string): string {
  return text.replace(CLOZE_REGEX, (_match, _index, answer) => answer)
}

export function validateClozeText(text: string): boolean {
  const regex = new RegExp(CLOZE_REGEX.source, 'g')
  return regex.test(text)
}

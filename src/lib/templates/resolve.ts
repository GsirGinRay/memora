import type { Card } from '@/types/database'
import type { CardTemplate } from '@/types/card-template'
import { getBuiltInTemplate, getBuiltInTemplateById, isBuiltInTemplateId } from './built-in'

export function resolveTemplate(
  card: Card,
  customTemplatesMap: Map<string, CardTemplate>
): CardTemplate | null {
  if (card.templateId) {
    if (isBuiltInTemplateId(card.templateId)) {
      return getBuiltInTemplateById(card.templateId) ?? null
    }
    return customTemplatesMap.get(card.templateId) ?? null
  }

  return getBuiltInTemplate(card.cardType) ?? null
}

export function buildTemplatesMap(templates: CardTemplate[]): Map<string, CardTemplate> {
  const map = new Map<string, CardTemplate>()
  for (const t of templates) {
    map.set(t.id, t)
  }
  return map
}

'use client'

import { useTranslations } from 'next-intl'
import { Label } from '@/components/ui/label'
import { BlockFieldRenderer } from './block-field-renderer'
import type { CardTemplate, FieldValues } from '@/types/card-template'

interface TemplateCardFormProps {
  template: CardTemplate
  fieldValues: FieldValues
  onFieldValuesChange: (values: FieldValues) => void
}

export function TemplateCardForm({
  template,
  fieldValues,
  onFieldValuesChange,
}: TemplateCardFormProps) {
  const t = useTranslations('template')

  const updateField = (blockId: string, value: string) => {
    onFieldValuesChange({ ...fieldValues, [blockId]: value })
  }

  return (
    <div className="space-y-4">
      {template.frontBlocks.length > 0 && (
        <div className="space-y-3">
          <Label className="text-base font-semibold">{t('frontSide')}</Label>
          {template.frontBlocks.map((block) => (
            <BlockFieldRenderer
              key={block.id}
              block={block}
              value={fieldValues[block.id] ?? ''}
              onChange={(v) => updateField(block.id, v)}
            />
          ))}
        </div>
      )}

      {template.backBlocks.length > 0 && (
        <div className="space-y-3">
          <Label className="text-base font-semibold">{t('backSide')}</Label>
          {template.backBlocks.map((block) => (
            <BlockFieldRenderer
              key={block.id}
              block={block}
              value={fieldValues[block.id] ?? ''}
              onChange={(v) => updateField(block.id, v)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

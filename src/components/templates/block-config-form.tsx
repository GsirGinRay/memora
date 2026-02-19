'use client'

import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import type { TemplateBlock } from '@/types/card-template'

interface BlockConfigFormProps {
  block: TemplateBlock
  onChange: (updated: TemplateBlock) => void
}

export function BlockConfigForm({ block, onChange }: BlockConfigFormProps) {
  const t = useTranslations('template')

  return (
    <div className="space-y-3 p-3 border rounded-md bg-muted/30">
      <div className="space-y-1">
        <Label className="text-xs">{t('blockLabel')}</Label>
        <Input
          value={block.label}
          onChange={(e) => onChange({ ...block, label: e.target.value })}
          className="h-8 text-sm"
        />
      </div>

      {block.type === 'text' && (
        <>
          <div className="space-y-1">
            <Label className="text-xs">{t('placeholder')}</Label>
            <Input
              value={block.placeholder ?? ''}
              onChange={(e) =>
                onChange({ ...block, placeholder: e.target.value || undefined })
              }
              className="h-8 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={block.markdown ?? false}
              onCheckedChange={(checked) =>
                onChange({ ...block, markdown: checked })
              }
            />
            <Label className="text-xs">{t('markdown')}</Label>
          </div>
        </>
      )}

      {block.type === 'audio' && (
        <div className="flex items-center gap-2">
          <Switch
            checked={block.autoplay ?? false}
            onCheckedChange={(checked) =>
              onChange({ ...block, autoplay: checked })
            }
          />
          <Label className="text-xs">{t('autoplay')}</Label>
        </div>
      )}

      {block.type !== 'divider' && (
        <div className="flex items-center gap-2">
          <Switch
            checked={block.required ?? false}
            onCheckedChange={(checked) =>
              onChange({ ...block, required: checked })
            }
          />
          <Label className="text-xs">{t('required')}</Label>
        </div>
      )}
    </div>
  )
}

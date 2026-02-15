'use client'

import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { useOcclusionStore } from '@/stores/occlusion-store'

export function OcclusionRectList() {
  const t = useTranslations('card.occlusion')
  const rects = useOcclusionStore((s) => s.rects)
  const updateRectLabel = useOcclusionStore((s) => s.updateRectLabel)
  const removeRect = useOcclusionStore((s) => s.removeRect)

  if (rects.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        {t('noRects')}
      </p>
    )
  }

  return (
    <div className="space-y-2 max-h-[200px] overflow-y-auto">
      {rects.map((rect, index) => (
        <div key={rect.id} className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-6 shrink-0">
            #{index + 1}
          </span>
          <div
            className="w-4 h-4 rounded-sm shrink-0"
            style={{ backgroundColor: getRectColor(index) }}
          />
          <Input
            value={rect.label}
            onChange={(e) => updateRectLabel(rect.id, e.target.value)}
            placeholder={t('labelPlaceholder')}
            className="h-8 text-sm"
            maxLength={100}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-destructive"
            onClick={() => removeRect(rect.id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  )
}

const RECT_COLORS = [
  'rgba(239, 68, 68, 0.7)',
  'rgba(59, 130, 246, 0.7)',
  'rgba(34, 197, 94, 0.7)',
  'rgba(168, 85, 247, 0.7)',
  'rgba(249, 115, 22, 0.7)',
  'rgba(236, 72, 153, 0.7)',
  'rgba(20, 184, 166, 0.7)',
  'rgba(245, 158, 11, 0.7)',
]

export function getRectColor(index: number): string {
  return RECT_COLORS[index % RECT_COLORS.length]
}

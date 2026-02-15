'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Pencil, Hand, Undo2, Trash2 } from 'lucide-react'
import { useOcclusionStore } from '@/stores/occlusion-store'

export function OcclusionToolbar() {
  const t = useTranslations('card.occlusion')
  const drawMode = useOcclusionStore((s) => s.drawMode)
  const setDrawMode = useOcclusionStore((s) => s.setDrawMode)
  const undo = useOcclusionStore((s) => s.undo)
  const clearAll = useOcclusionStore((s) => s.clearAll)
  const historyLen = useOcclusionStore((s) => s.history.length)
  const rectsLen = useOcclusionStore((s) => s.rects.length)

  return (
    <div className="flex items-center gap-1 p-2 border rounded-lg bg-background">
      <Button
        variant={drawMode === 'draw' ? 'default' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={() => setDrawMode('draw')}
        title={t('drawMode')}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant={drawMode === 'pan' ? 'default' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={() => setDrawMode('pan')}
        title={t('panMode')}
      >
        <Hand className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-border mx-1" />
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={undo}
        disabled={historyLen === 0}
        title={t('undo')}
      >
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive"
        onClick={clearAll}
        disabled={rectsLen === 0}
        title={t('clearAll')}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

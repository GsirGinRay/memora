'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useDeckTags } from '@/hooks/use-custom-study'
import type { CustomStudyMode } from '@/types/database'

interface CustomStudyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deckId: string
  locale: string
}

const MODES: CustomStudyMode[] = ['all', 'failed', 'tags', 'ahead']

export function CustomStudyDialog({
  open,
  onOpenChange,
  deckId,
  locale,
}: CustomStudyDialogProps) {
  const t = useTranslations('study')
  const tCommon = useTranslations('common')
  const router = useRouter()

  const [selectedMode, setSelectedMode] = useState<CustomStudyMode>('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const { data: allTags } = useDeckTags(deckId)

  const modeLabels: Record<CustomStudyMode, string> = {
    all: t('modeAll'),
    failed: t('modeFailed'),
    tags: t('modeTags'),
    ahead: t('modeAhead'),
  }

  const modeDescriptions: Record<CustomStudyMode, string> = {
    all: t('modeAllDesc'),
    failed: t('modeFailedDesc'),
    tags: t('modeTagsDesc'),
    ahead: t('modeAheadDesc'),
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    )
  }

  const handleStart = () => {
    const params = new URLSearchParams()
    params.set('mode', selectedMode)
    if (selectedMode === 'tags' && selectedTags.length > 0) {
      params.set('tags', selectedTags.join(','))
    }
    router.push(`/${locale}/study/${deckId}?${params.toString()}`)
    onOpenChange(false)
  }

  const canStart =
    selectedMode !== 'tags' || selectedTags.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('customStudy')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            {MODES.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setSelectedMode(mode)}
                className={`w-full text-left rounded-lg border p-3 transition-colors ${
                  selectedMode === mode
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-accent/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                      selectedMode === mode
                        ? 'border-primary'
                        : 'border-muted-foreground'
                    }`}
                  >
                    {selectedMode === mode && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <span className="font-medium">{modeLabels[mode]}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1 ml-6">
                  {modeDescriptions[mode]}
                </p>
              </button>
            ))}
          </div>

          {selectedMode === 'tags' && (
            <div className="space-y-2">
              <Label>{t('selectTags')}</Label>
              {allTags && allTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{tCommon('noData')}</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tCommon('cancel')}
          </Button>
          <Button onClick={handleStart} disabled={!canStart}>
            {t('startCustomStudy')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

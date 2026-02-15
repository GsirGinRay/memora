'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImageUpload } from './image-upload'
import { OcclusionCanvas } from './occlusion-canvas'
import { OcclusionToolbar } from './occlusion-toolbar'
import { OcclusionRectList } from './occlusion-rect-list'
import { useOcclusionStore } from '@/stores/occlusion-store'
import { useCreateImageOcclusionCards } from '@/hooks/use-cards'
import { toast } from 'sonner'
import { useState } from 'react'

interface ImageOcclusionEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deckId: string
}

export function ImageOcclusionEditor({
  open,
  onOpenChange,
  deckId,
}: ImageOcclusionEditorProps) {
  const t = useTranslations('card.occlusion')
  const tCommon = useTranslations('common')

  const imageUrl = useOcclusionStore((s) => s.imageUrl)
  const setImageUrl = useOcclusionStore((s) => s.setImageUrl)
  const rects = useOcclusionStore((s) => s.rects)
  const reset = useOcclusionStore((s) => s.reset)

  const [tags, setTags] = useState('')
  const createCards = useCreateImageOcclusionCards()

  useEffect(() => {
    if (!open) {
      reset()
      setTags('')
    }
  }, [open, reset])

  const canSave = imageUrl && rects.length > 0

  const handleSave = () => {
    if (!imageUrl || rects.length === 0) return

    const tagList = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    createCards.mutate(
      {
        deckId,
        imageUrl,
        rects,
        tags: tagList,
      },
      {
        onSuccess: (cards) => {
          toast.success(t('savedCards', { count: cards.length }))
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!imageUrl ? (
            <ImageUpload onUploaded={setImageUrl} />
          ) : (
            <>
              <OcclusionToolbar />
              <OcclusionCanvas />
              <p className="text-sm text-muted-foreground">
                {t('rectCount', { count: rects.length })}
              </p>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {tCommon('cancel')}
          </Button>
          {imageUrl && (
            <Button
              onClick={handleSave}
              disabled={!canSave || createCards.isPending}
            >
              {createCards.isPending
                ? '...'
                : t('saveCards', { count: rects.length })}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

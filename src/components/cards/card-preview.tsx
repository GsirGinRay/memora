'use client'

import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import type { Card } from '@/types/database'

interface CardPreviewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  card: Card | null
}

export function CardPreview({ open, onOpenChange, card }: CardPreviewProps) {
  const t = useTranslations('card')

  if (!card) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {t('preview')}
            <Badge variant="secondary">{card.card_type}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md border p-4">
            <p className="text-xs text-muted-foreground mb-1">{t('front')}</p>
            <p className="whitespace-pre-wrap text-lg">{card.front}</p>
          </div>

          <div className="rounded-md border p-4">
            <p className="text-xs text-muted-foreground mb-1">{t('back')}</p>
            <p className="whitespace-pre-wrap text-lg">{card.back}</p>
          </div>

          {card.hint && (
            <div className="rounded-md border p-4">
              <p className="text-xs text-muted-foreground mb-1">{t('hint')}</p>
              <p>{card.hint}</p>
            </div>
          )}

          {card.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {card.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

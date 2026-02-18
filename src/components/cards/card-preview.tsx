'use client'

import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { MarkdownRenderer } from '@/components/shared/markdown-renderer'
import { AudioPlayer } from '@/components/shared/audio-player'
import { TTSButton } from '@/components/shared/tts-button'
import { getTTSLang } from '@/lib/tts/constants'
import type { Card } from '@/types/database'

interface CardPreviewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  card: Card | null
}

export function CardPreview({ open, onOpenChange, card }: CardPreviewProps) {
  const t = useTranslations('card')

  if (!card) return null

  const isOcclusion = card.cardType === 'image_occlusion'
  const imageUrl = isOcclusion ? card.mediaUrls[0] : null
  const allRects = isOcclusion ? (card.occlusionData ?? []) : []

  const ttsLang = getTTSLang(card.media?.tts?.lang)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {t('preview')}
            <Badge variant="secondary">{card.cardType}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isOcclusion && imageUrl ? (
            <div className="relative rounded-md overflow-hidden border">
              <img
                src={imageUrl}
                alt=""
                className="w-full h-auto block"
                draggable={false}
              />
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full"
              >
                {allRects.map((rect, i) => (
                  <g key={rect.id}>
                    <rect
                      x={rect.x}
                      y={rect.y}
                      width={rect.width}
                      height={rect.height}
                      fill={`rgba(239, 68, 68, ${rect.id === card.front ? 0.7 : 0.3})`}
                      stroke="white"
                      strokeWidth="0.3"
                      rx="0.5"
                    />
                    <text
                      x={rect.x + rect.width / 2}
                      y={rect.y + rect.height / 2}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="white"
                      fontSize="2.5"
                      fontWeight="bold"
                    >
                      {rect.label || `#${i + 1}`}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          ) : (
            <>
              <div className="rounded-md border p-4">
                <p className="text-xs text-muted-foreground mb-1">{t('front')}</p>
                {card.media?.front?.imageUrl && (
                  <img src={card.media.front.imageUrl} alt="" className="max-h-40 rounded-md mb-2" />
                )}
                <MarkdownRenderer content={card.front} className="text-lg" />
                {card.media?.front?.audioUrl && (
                  <div className="mt-2">
                    <AudioPlayer src={card.media.front.audioUrl} />
                  </div>
                )}
                {card.media?.tts?.enabled && (
                  <div className="mt-1">
                    <TTSButton text={card.front} lang={ttsLang} />
                  </div>
                )}
              </div>

              <div className="rounded-md border p-4">
                <p className="text-xs text-muted-foreground mb-1">{t('back')}</p>
                {card.media?.back?.imageUrl && (
                  <img src={card.media.back.imageUrl} alt="" className="max-h-40 rounded-md mb-2" />
                )}
                <MarkdownRenderer content={card.back} className="text-lg" />
                {card.media?.back?.audioUrl && (
                  <div className="mt-2">
                    <AudioPlayer src={card.media.back.audioUrl} />
                  </div>
                )}
                {card.media?.tts?.enabled && (
                  <div className="mt-1">
                    <TTSButton text={card.back} lang={ttsLang} />
                  </div>
                )}
              </div>
            </>
          )}

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

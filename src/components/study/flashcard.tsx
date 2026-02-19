'use client'

import { Card, CardContent } from '@/components/ui/card'
import { ImageOcclusionCard } from '@/components/study/image-occlusion-card'
import { FlashcardFace } from '@/components/study/flashcard-face'
import { BlockRenderer } from '@/components/study/block-renderer'
import { useAutoTTS } from '@/hooks/use-auto-tts'
import type { Card as CardType } from '@/types/database'
import type { CardTemplate } from '@/types/card-template'

interface FlashcardProps {
  card: CardType
  flipped: boolean
  onFlip: () => void
  template?: CardTemplate | null
}

export function Flashcard({ card, flipped, onFlip, template }: FlashcardProps) {
  useAutoTTS({
    text: card.front,
    media: card.media,
    side: 'front',
    trigger: !flipped,
  })

  useAutoTTS({
    text: card.back,
    media: card.media,
    side: 'back',
    trigger: flipped,
  })

  if (card.cardType === 'image_occlusion') {
    return <ImageOcclusionCard card={card} flipped={flipped} onFlip={onFlip} />
  }

  const useTemplateRendering = template && card.templateId && card.fieldValues

  const hasMedia = !!card.media?.front?.imageUrl || !!card.media?.front?.audioUrl ||
    !!card.media?.back?.imageUrl || !!card.media?.back?.audioUrl || !!card.media?.tts?.enabled

  return (
    <div className="flashcard-perspective w-full max-w-lg mx-auto">
      <div
        className={`flashcard-inner relative w-full min-h-[300px] cursor-pointer ${flipped ? 'flipped' : ''}`}
        onClick={onFlip}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault()
            onFlip()
          }
        }}
      >
        {/* Front */}
        <Card className="flashcard-face absolute inset-0 flex items-center justify-center">
          <CardContent className="text-center p-8 w-full">
            {useTemplateRendering ? (
              <BlockRenderer
                blocks={template.frontBlocks}
                fieldValues={card.fieldValues!}
              />
            ) : hasMedia ? (
              <FlashcardFace
                text={card.front}
                side="front"
                media={card.media}
                autoPlay={!flipped}
              />
            ) : (
              <>
                <p className="text-2xl whitespace-pre-wrap">{card.front}</p>
                {card.hint && !flipped && (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Hint: {card.hint}
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Back */}
        <Card className="flashcard-face flashcard-back absolute inset-0 flex items-center justify-center">
          <CardContent className="text-center p-8 w-full">
            <p className="text-sm text-muted-foreground mb-2">{card.front}</p>
            <hr className="my-4" />
            {useTemplateRendering ? (
              <BlockRenderer
                blocks={template.backBlocks}
                fieldValues={card.fieldValues!}
              />
            ) : hasMedia ? (
              <FlashcardFace
                text={card.back}
                side="back"
                media={card.media}
                autoPlay={flipped}
              />
            ) : (
              <p className="text-2xl whitespace-pre-wrap">{card.back}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

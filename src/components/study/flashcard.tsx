'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Card as CardType } from '@/types/database'

interface FlashcardProps {
  card: CardType
  flipped: boolean
  onFlip: () => void
}

export function Flashcard({ card, flipped, onFlip }: FlashcardProps) {
  return (
    <div className="perspective-1000 w-full max-w-lg mx-auto">
      <div
        className={cn(
          'relative w-full min-h-[300px] cursor-pointer transition-transform duration-500',
          'transform-style-3d',
          flipped && 'rotate-y-180'
        )}
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
        <Card
          className={cn(
            'absolute inset-0 backface-hidden flex items-center justify-center',
            flipped && 'invisible'
          )}
        >
          <CardContent className="text-center p-8">
            <p className="text-2xl whitespace-pre-wrap">{card.front}</p>
            {card.hint && !flipped && (
              <p className="mt-4 text-sm text-muted-foreground">
                Hint: {card.hint}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Back */}
        <Card
          className={cn(
            'absolute inset-0 backface-hidden flex items-center justify-center',
            !flipped && 'invisible'
          )}
        >
          <CardContent className="text-center p-8">
            <p className="text-sm text-muted-foreground mb-2">{card.front}</p>
            <hr className="my-4" />
            <p className="text-2xl whitespace-pre-wrap">{card.back}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

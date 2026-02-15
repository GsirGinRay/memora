'use client'

import type { Card } from '@/types/database'
import type { OcclusionRect } from '@/types/database'

interface ImageOcclusionCardProps {
  card: Card
  flipped: boolean
  onFlip: () => void
}

export function ImageOcclusionCard({
  card,
  flipped,
  onFlip,
}: ImageOcclusionCardProps) {
  const imageUrl = card.mediaUrls[0]
  const allRects = card.occlusionData ?? []
  const activeRectId = card.front

  if (!imageUrl) return null

  return (
    <div
      className="w-full max-w-lg mx-auto cursor-pointer"
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
      <div className="relative rounded-lg overflow-hidden border bg-muted">
        <img
          src={imageUrl}
          alt=""
          className="w-full h-auto block select-none"
          draggable={false}
        />
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full"
        >
          {allRects.map((rect) => (
            <OcclusionOverlay
              key={rect.id}
              rect={rect}
              isActive={rect.id === activeRectId}
              flipped={flipped}
            />
          ))}
        </svg>
      </div>
    </div>
  )
}

interface OcclusionOverlayProps {
  rect: OcclusionRect
  isActive: boolean
  flipped: boolean
}

function OcclusionOverlay({ rect, isActive, flipped }: OcclusionOverlayProps) {
  if (isActive && !flipped) {
    return (
      <g>
        <rect
          x={rect.x}
          y={rect.y}
          width={rect.width}
          height={rect.height}
          fill="#dc2626"
          stroke="#b91c1c"
          strokeWidth="0.4"
          rx="0.5"
        />
        <text
          x={rect.x + rect.width / 2}
          y={rect.y + rect.height / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontSize="3"
          fontWeight="bold"
        >
          ?
        </text>
      </g>
    )
  }

  if (isActive && flipped) {
    return (
      <g>
        <rect
          x={rect.x}
          y={rect.y}
          width={rect.width}
          height={rect.height}
          fill="rgba(34, 197, 94, 0.3)"
          stroke="rgba(34, 197, 94, 0.9)"
          strokeWidth="0.4"
          rx="0.5"
        />
        <text
          x={rect.x + rect.width / 2}
          y={rect.y + rect.height / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill="rgba(34, 197, 94, 1)"
          fontSize="2.5"
          fontWeight="bold"
        >
          {rect.label}
        </text>
      </g>
    )
  }

  return (
    <g>
      <rect
        x={rect.x}
        y={rect.y}
        width={rect.width}
        height={rect.height}
        fill="rgba(148, 163, 184, 0.25)"
        stroke="rgba(148, 163, 184, 0.5)"
        strokeWidth="0.2"
        rx="0.5"
      />
      <text
        x={rect.x + rect.width / 2}
        y={rect.y + rect.height / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill="rgba(100, 116, 139, 0.8)"
        fontSize="2"
      >
        {rect.label}
      </text>
    </g>
  )
}

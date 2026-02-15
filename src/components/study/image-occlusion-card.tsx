'use client'

import type { Card, OcclusionRect } from '@/types/database'

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
  // Front: active rect fully occluded, others lightly shaded
  if (!flipped) {
    if (isActive) {
      return (
        <g>
          <rect
            x={rect.x}
            y={rect.y}
            width={rect.width}
            height={rect.height}
            fill="#dc2626"
            stroke="#991b1b"
            strokeWidth="0.5"
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
    return (
      <rect
        x={rect.x}
        y={rect.y}
        width={rect.width}
        height={rect.height}
        fill="rgba(100, 116, 139, 0.2)"
        stroke="rgba(100, 116, 139, 0.4)"
        strokeWidth="0.2"
        rx="0.5"
      />
    )
  }

  // Back: active rect highlighted with green border, others hidden
  if (isActive) {
    return (
      <rect
        x={rect.x}
        y={rect.y}
        width={rect.width}
        height={rect.height}
        fill="none"
        stroke="#16a34a"
        strokeWidth="0.8"
        rx="0.5"
        strokeDasharray="2 1"
      />
    )
  }

  return null
}

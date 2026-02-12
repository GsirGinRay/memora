'use client'

import { useState, useEffect } from 'react'
import { Stage, Layer, Rect, Image as KonvaImage } from 'react-konva'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import type { OcclusionRect } from '@/types/database'

interface OcclusionViewerProps {
  imageUrl: string
  rects: OcclusionRect[]
  revealedIds: Set<string>
  onReveal: (id: string) => void
}

export function OcclusionViewer({
  imageUrl,
  rects,
  revealedIds,
  onReveal,
}: OcclusionViewerProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => setImage(img)
    img.src = imageUrl
  }, [imageUrl])

  const stageWidth = image?.width ?? 600
  const stageHeight = image?.height ?? 400
  const scale = Math.min(1, 600 / stageWidth)

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden bg-muted">
        <Stage
          width={stageWidth * scale}
          height={stageHeight * scale}
          scaleX={scale}
          scaleY={scale}
        >
          <Layer>
            {image && (
              <KonvaImage image={image} width={stageWidth} height={stageHeight} />
            )}
            {rects.map((rect) =>
              revealedIds.has(rect.id) ? null : (
                <Rect
                  key={rect.id}
                  x={rect.x}
                  y={rect.y}
                  width={rect.width}
                  height={rect.height}
                  fill="rgba(255, 0, 0, 0.85)"
                  stroke="#ff0000"
                  strokeWidth={2}
                  onClick={() => onReveal(rect.id)}
                  onTap={() => onReveal(rect.id)}
                />
              )
            )}
          </Layer>
        </Stage>
      </div>

      <div className="flex flex-wrap gap-2">
        {rects.map((rect) => (
          <Button
            key={rect.id}
            variant={revealedIds.has(rect.id) ? 'default' : 'outline'}
            size="sm"
            onClick={() => onReveal(rect.id)}
            className="gap-1"
          >
            <Eye className="h-3 w-3" />
            {rect.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

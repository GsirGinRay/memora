'use client'

import { useState, useRef, useCallback } from 'react'
import { Stage, Layer, Rect, Image as KonvaImage, Transformer } from 'react-konva'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Save } from 'lucide-react'
import type { OcclusionRect } from '@/types/database'
import { v4 as uuidv4 } from 'uuid'

interface OcclusionEditorProps {
  imageUrl: string
  initialRects?: OcclusionRect[]
  onSave: (rects: OcclusionRect[]) => void
}

export function OcclusionEditor({
  imageUrl,
  initialRects = [],
  onSave,
}: OcclusionEditorProps) {
  const [rects, setRects] = useState<OcclusionRect[]>(initialRects)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const stageRef = useRef(null)

  // Load image
  useState(() => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => setImage(img)
    img.src = imageUrl
  })

  const addRect = useCallback(() => {
    const newRect: OcclusionRect = {
      id: uuidv4(),
      x: 50,
      y: 50,
      width: 100,
      height: 60,
      label: `${rects.length + 1}`,
    }
    setRects((prev) => [...prev, newRect])
    setSelectedId(newRect.id)
  }, [rects.length])

  const deleteSelected = useCallback(() => {
    if (!selectedId) return
    setRects((prev) => prev.filter((r) => r.id !== selectedId))
    setSelectedId(null)
  }, [selectedId])

  const handleDragEnd = useCallback(
    (id: string, x: number, y: number) => {
      setRects((prev) =>
        prev.map((r) => (r.id === id ? { ...r, x, y } : r))
      )
    },
    []
  )

  const handleTransformEnd = useCallback(
    (id: string, x: number, y: number, width: number, height: number) => {
      setRects((prev) =>
        prev.map((r) => (r.id === id ? { ...r, x, y, width, height } : r))
      )
    },
    []
  )

  const stageWidth = image?.width ?? 600
  const stageHeight = image?.height ?? 400
  const scale = Math.min(1, 600 / stageWidth)

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={addRect} className="gap-1">
          <Plus className="h-4 w-4" />
          Add Mask
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={deleteSelected}
          disabled={!selectedId}
          className="gap-1"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
        <Button
          size="sm"
          onClick={() => onSave(rects)}
          className="gap-1 ml-auto"
        >
          <Save className="h-4 w-4" />
          Save
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden bg-muted">
        <Stage
          ref={stageRef}
          width={stageWidth * scale}
          height={stageHeight * scale}
          scaleX={scale}
          scaleY={scale}
          onClick={(e) => {
            if (e.target === e.target.getStage()) {
              setSelectedId(null)
            }
          }}
        >
          <Layer>
            {image && (
              <KonvaImage image={image} width={stageWidth} height={stageHeight} />
            )}
            {rects.map((rect) => (
              <OcclusionRectShape
                key={rect.id}
                rect={rect}
                isSelected={rect.id === selectedId}
                onSelect={() => setSelectedId(rect.id)}
                onDragEnd={(x, y) => handleDragEnd(rect.id, x, y)}
                onTransformEnd={(x, y, w, h) =>
                  handleTransformEnd(rect.id, x, y, w, h)
                }
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  )
}

interface OcclusionRectShapeProps {
  rect: OcclusionRect
  isSelected: boolean
  onSelect: () => void
  onDragEnd: (x: number, y: number) => void
  onTransformEnd: (x: number, y: number, width: number, height: number) => void
}

function OcclusionRectShape({
  rect,
  isSelected,
  onSelect,
  onDragEnd,
  onTransformEnd,
}: OcclusionRectShapeProps) {
  const shapeRef = useRef<import('konva/lib/shapes/Rect').Rect>(null)
  const trRef = useRef<import('konva/lib/shapes/Transformer').Transformer>(null)

  return (
    <>
      <Rect
        ref={shapeRef}
        x={rect.x}
        y={rect.y}
        width={rect.width}
        height={rect.height}
        fill="rgba(255, 0, 0, 0.5)"
        stroke={isSelected ? '#fff' : '#ff0000'}
        strokeWidth={2}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onDragEnd(e.target.x(), e.target.y())
        }}
        onTransformEnd={() => {
          const node = shapeRef.current
          if (!node) return
          const scaleX = node.scaleX()
          const scaleY = node.scaleY()
          node.scaleX(1)
          node.scaleY(1)
          onTransformEnd(
            node.x(),
            node.y(),
            Math.max(5, node.width() * scaleX),
            Math.max(5, node.height() * scaleY)
          )
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          nodes={shapeRef.current ? [shapeRef.current] : []}
          boundBoxFunc={(oldBox, newBox) => {
            if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
              return oldBox
            }
            return newBox
          }}
        />
      )}
    </>
  )
}

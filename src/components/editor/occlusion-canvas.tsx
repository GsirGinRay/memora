'use client'

import { useRef, useCallback, useEffect } from 'react'
import { useOcclusionStore } from '@/stores/occlusion-store'
import { usePinchZoom } from '@/hooks/use-pinch-zoom'
import { createOcclusionRect, isRectValid, normalizeRect } from '@/lib/occlusion/utils'
import { getRectColor } from './occlusion-rect-list'

export function OcclusionCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const drawStartRef = useRef<{ x: number; y: number } | null>(null)
  const panStartRef = useRef<{ x: number; y: number } | null>(null)
  const activePointerRef = useRef<number | null>(null)

  const imageUrl = useOcclusionStore((s) => s.imageUrl)
  const rects = useOcclusionStore((s) => s.rects)
  const drawMode = useOcclusionStore((s) => s.drawMode)
  const drawingRect = useOcclusionStore((s) => s.drawingRect)
  const setDrawingRect = useOcclusionStore((s) => s.setDrawingRect)
  const addRect = useOcclusionStore((s) => s.addRect)
  const zoom = useOcclusionStore((s) => s.zoom)
  const panX = useOcclusionStore((s) => s.panX)
  const panY = useOcclusionStore((s) => s.panY)
  const setZoom = useOcclusionStore((s) => s.setZoom)
  const setPan = useOcclusionStore((s) => s.setPan)

  const pinchZoom = usePinchZoom({
    onZoomChange: setZoom,
    onPanChange: setPan,
    zoom,
    panX,
    panY,
  })

  const getSvgPoint = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current
      if (!svg) return { x: 0, y: 0 }
      const rect = svg.getBoundingClientRect()
      return {
        x: ((clientX - rect.left) / rect.width) * 100,
        y: ((clientY - rect.top) / rect.height) * 100,
      }
    },
    []
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      pinchZoom.handlePointerDown(e)

      if (pinchZoom.pointerCount() >= 2) return
      if (activePointerRef.current !== null) return

      activePointerRef.current = e.pointerId
      ;(e.target as Element).setPointerCapture(e.pointerId)

      const point = getSvgPoint(e.clientX, e.clientY)

      if (drawMode === 'draw') {
        drawStartRef.current = point
        setDrawingRect({ x: point.x, y: point.y, width: 0, height: 0 })
      } else {
        panStartRef.current = { x: e.clientX - panX, y: e.clientY - panY }
      }
    },
    [drawMode, getSvgPoint, panX, panY, pinchZoom, setDrawingRect]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      pinchZoom.handlePointerMove(e)

      if (pinchZoom.pointerCount() >= 2) return
      if (activePointerRef.current !== e.pointerId) return

      if (drawMode === 'draw' && drawStartRef.current) {
        const point = getSvgPoint(e.clientX, e.clientY)
        setDrawingRect({
          x: drawStartRef.current.x,
          y: drawStartRef.current.y,
          width: point.x - drawStartRef.current.x,
          height: point.y - drawStartRef.current.y,
        })
      } else if (drawMode === 'pan' && panStartRef.current) {
        setPan(e.clientX - panStartRef.current.x, e.clientY - panStartRef.current.y)
      }
    },
    [drawMode, getSvgPoint, pinchZoom, setDrawingRect, setPan]
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      pinchZoom.handlePointerUp(e)

      if (activePointerRef.current !== e.pointerId) return
      activePointerRef.current = null

      if (drawMode === 'draw' && drawingRect) {
        const normalized = normalizeRect(drawingRect)
        if (isRectValid(normalized)) {
          const container = containerRef.current
          if (container) {
            const newRect = createOcclusionRect(
              normalizeRect({
                x: drawingRect.x,
                y: drawingRect.y,
                width: drawingRect.width,
                height: drawingRect.height,
              }),
              { width: 100, height: 100 }
            )
            addRect(newRect)
          }
        }
        setDrawingRect(null)
        drawStartRef.current = null
      }

      panStartRef.current = null
    },
    [drawMode, drawingRect, addRect, setDrawingRect, pinchZoom]
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const preventScroll = (e: TouchEvent) => e.preventDefault()
    container.addEventListener('touchmove', preventScroll, { passive: false })
    return () => container.removeEventListener('touchmove', preventScroll)
  }, [])

  if (!imageUrl) return null

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-lg border bg-muted occlusion-canvas"
      style={{ touchAction: 'none' }}
    >
      <div
        style={{
          transform: `scale(${zoom}) translate(${panX / zoom}px, ${panY / zoom}px)`,
          transformOrigin: '0 0',
        }}
      >
        <div className="relative w-full">
          <img
            src={imageUrl}
            alt=""
            className="w-full h-auto block select-none pointer-events-none"
            draggable={false}
          />
          <svg
            ref={svgRef}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {rects.map((rect, i) => (
              <rect
                key={rect.id}
                x={rect.x}
                y={rect.y}
                width={rect.width}
                height={rect.height}
                fill={getRectColor(i)}
                stroke="white"
                strokeWidth="0.3"
                rx="0.5"
              />
            ))}
            {drawingRect && (
              <rect
                x={drawingRect.width < 0 ? drawingRect.x + drawingRect.width : drawingRect.x}
                y={drawingRect.height < 0 ? drawingRect.y + drawingRect.height : drawingRect.y}
                width={Math.abs(drawingRect.width)}
                height={Math.abs(drawingRect.height)}
                fill="rgba(59, 130, 246, 0.3)"
                stroke="rgba(59, 130, 246, 0.8)"
                strokeWidth="0.3"
                strokeDasharray="1"
                rx="0.5"
              />
            )}
          </svg>
        </div>
      </div>
    </div>
  )
}

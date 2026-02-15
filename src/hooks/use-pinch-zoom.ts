import { useRef, useCallback } from 'react'

interface PinchZoomOptions {
  onZoomChange: (zoom: number) => void
  onPanChange: (x: number, y: number) => void
  zoom: number
  panX: number
  panY: number
}

interface PointerState {
  id: number
  x: number
  y: number
}

export function usePinchZoom({
  onZoomChange,
  onPanChange,
  zoom,
  panX,
  panY,
}: PinchZoomOptions) {
  const pointersRef = useRef<Map<number, PointerState>>(new Map())
  const lastDistRef = useRef<number | null>(null)
  const lastCenterRef = useRef<{ x: number; y: number } | null>(null)

  const getDistance = (p1: PointerState, p2: PointerState) =>
    Math.hypot(p2.x - p1.x, p2.y - p1.y)

  const getCenter = (p1: PointerState, p2: PointerState) => ({
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  })

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointersRef.current.set(e.pointerId, {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
    })
  }, [])

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const pointers = pointersRef.current
      if (!pointers.has(e.pointerId)) return

      pointers.set(e.pointerId, {
        id: e.pointerId,
        x: e.clientX,
        y: e.clientY,
      })

      if (pointers.size === 2) {
        const [p1, p2] = Array.from(pointers.values())
        const dist = getDistance(p1, p2)
        const center = getCenter(p1, p2)

        if (lastDistRef.current !== null && lastCenterRef.current !== null) {
          const scale = dist / lastDistRef.current
          const newZoom = Math.max(1, Math.min(5, zoom * scale))
          onZoomChange(newZoom)

          const dx = center.x - lastCenterRef.current.x
          const dy = center.y - lastCenterRef.current.y
          onPanChange(panX + dx, panY + dy)
        }

        lastDistRef.current = dist
        lastCenterRef.current = center
      }
    },
    [zoom, panX, panY, onZoomChange, onPanChange]
  )

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    pointersRef.current.delete(e.pointerId)
    if (pointersRef.current.size < 2) {
      lastDistRef.current = null
      lastCenterRef.current = null
    }
  }, [])

  const pointerCount = useCallback(() => pointersRef.current.size, [])

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    pointerCount,
  }
}

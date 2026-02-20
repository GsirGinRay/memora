import { useRef, useCallback, type RefObject } from 'react'

interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
}

interface SwipeState {
  startX: number
  startY: number
  startTime: number
}

const MIN_SWIPE_DISTANCE = 50
const MAX_SWIPE_TIME = 300

export function useSwipe(
  ref: RefObject<HTMLElement | null>,
  { onSwipeLeft, onSwipeRight }: SwipeHandlers
) {
  const stateRef = useRef<SwipeState | null>(null)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    stateRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
    }
  }, [])

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!stateRef.current) return

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - stateRef.current.startX
      const deltaY = touch.clientY - stateRef.current.startY
      const elapsed = Date.now() - stateRef.current.startTime

      stateRef.current = null

      if (elapsed > MAX_SWIPE_TIME) return
      if (Math.abs(deltaX) < MIN_SWIPE_DISTANCE) return
      if (Math.abs(deltaY) > Math.abs(deltaX)) return

      if (deltaX < 0) {
        onSwipeLeft?.()
      } else {
        onSwipeRight?.()
      }
    },
    [onSwipeLeft, onSwipeRight]
  )

  return { onTouchStart, onTouchEnd }
}

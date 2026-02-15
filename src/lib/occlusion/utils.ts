import type { OcclusionRect } from '@/types/database'

const MIN_RECT_SIZE = 2 // minimum 2% of image dimension

interface PixelRect {
  x: number
  y: number
  width: number
  height: number
}

interface ContainerSize {
  width: number
  height: number
}

export function pixelToPercent(
  rect: PixelRect,
  container: ContainerSize
): PixelRect {
  return {
    x: (rect.x / container.width) * 100,
    y: (rect.y / container.height) * 100,
    width: (rect.width / container.width) * 100,
    height: (rect.height / container.height) * 100,
  }
}

export function percentToPixel(
  rect: PixelRect,
  container: ContainerSize
): PixelRect {
  return {
    x: (rect.x / 100) * container.width,
    y: (rect.y / 100) * container.height,
    width: (rect.width / 100) * container.width,
    height: (rect.height / 100) * container.height,
  }
}

export function normalizeRect(rect: PixelRect): PixelRect {
  const x = rect.width < 0 ? rect.x + rect.width : rect.x
  const y = rect.height < 0 ? rect.y + rect.height : rect.y
  return {
    x,
    y,
    width: Math.abs(rect.width),
    height: Math.abs(rect.height),
  }
}

export function isRectValid(rect: PixelRect): boolean {
  const normalized = normalizeRect(rect)
  return normalized.width >= MIN_RECT_SIZE && normalized.height >= MIN_RECT_SIZE
}

export function clampRect(rect: PixelRect): PixelRect {
  const x = Math.max(0, Math.min(100, rect.x))
  const y = Math.max(0, Math.min(100, rect.y))
  const width = Math.min(rect.width, 100 - x)
  const height = Math.min(rect.height, 100 - y)
  return { x, y, width, height }
}

export function createOcclusionRect(
  rect: PixelRect,
  container: ContainerSize
): OcclusionRect {
  const percent = pixelToPercent(rect, container)
  const normalized = normalizeRect(percent)
  const clamped = clampRect(normalized)
  const id = `rect-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  return {
    id,
    ...clamped,
    label: '',
  }
}

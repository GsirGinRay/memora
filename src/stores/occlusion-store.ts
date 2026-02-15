import { create } from 'zustand'
import type { OcclusionRect } from '@/types/database'

type DrawMode = 'draw' | 'pan'

interface OcclusionState {
  imageUrl: string | null
  rects: OcclusionRect[]
  drawMode: DrawMode
  drawingRect: { x: number; y: number; width: number; height: number } | null
  history: OcclusionRect[][]
  zoom: number
  panX: number
  panY: number
}

interface OcclusionActions {
  setImageUrl: (url: string | null) => void
  addRect: (rect: OcclusionRect) => void
  removeRect: (id: string) => void
  updateRectLabel: (id: string, label: string) => void
  setDrawMode: (mode: DrawMode) => void
  setDrawingRect: (rect: OcclusionState['drawingRect']) => void
  undo: () => void
  clearAll: () => void
  setZoom: (zoom: number) => void
  setPan: (x: number, y: number) => void
  reset: () => void
}

const MAX_HISTORY = 50

const initialState: OcclusionState = {
  imageUrl: null,
  rects: [],
  drawMode: 'draw',
  drawingRect: null,
  history: [],
  zoom: 1,
  panX: 0,
  panY: 0,
}

export const useOcclusionStore = create<OcclusionState & OcclusionActions>(
  (set, get) => ({
    ...initialState,

    setImageUrl: (url) => set({ imageUrl: url }),

    addRect: (rect) => {
      const { rects, history } = get()
      const newHistory = [...history, rects].slice(-MAX_HISTORY)
      set({
        history: newHistory,
        rects: [...rects, rect],
      })
    },

    removeRect: (id) => {
      const { rects, history } = get()
      const newHistory = [...history, rects].slice(-MAX_HISTORY)
      set({
        history: newHistory,
        rects: rects.filter((r) => r.id !== id),
      })
    },

    updateRectLabel: (id, label) => {
      set({
        rects: get().rects.map((r) =>
          r.id === id ? { ...r, label } : r
        ),
      })
    },

    setDrawMode: (mode) => set({ drawMode: mode }),

    setDrawingRect: (rect) => set({ drawingRect: rect }),

    undo: () => {
      const { history } = get()
      if (history.length === 0) return
      const prev = history[history.length - 1]
      set({
        rects: prev,
        history: history.slice(0, -1),
      })
    },

    clearAll: () => {
      const { rects } = get()
      if (rects.length === 0) return
      set({
        history: [...get().history, rects],
        rects: [],
      })
    },

    setZoom: (zoom) => set({ zoom: Math.max(1, Math.min(5, zoom)) }),

    setPan: (x, y) => set({ panX: x, panY: y }),

    reset: () => set(initialState),
  })
)

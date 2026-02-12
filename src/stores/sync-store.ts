import { create } from 'zustand'
import type { SyncStatus } from '@/lib/sync/sync-engine'

interface SyncState {
  status: SyncStatus
  lastSyncAt: string | null
  pendingCount: number
  setStatus: (status: SyncStatus) => void
  setLastSyncAt: (at: string) => void
  setPendingCount: (count: number) => void
}

export const useSyncStore = create<SyncState>((set) => ({
  status: 'idle',
  lastSyncAt: null,
  pendingCount: 0,
  setStatus: (status) => set({ status }),
  setLastSyncAt: (lastSyncAt) => set({ lastSyncAt }),
  setPendingCount: (pendingCount) => set({ pendingCount }),
}))

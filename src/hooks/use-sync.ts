'use client'

import { useEffect, useCallback } from 'react'
import { useSyncStore } from '@/stores/sync-store'
import { useAuthStore } from '@/stores/auth-store'
import { pushChanges, pullChanges, isOnline } from '@/lib/sync/sync-engine'
import { localDb } from '@/lib/db/local-db'

export function useSync() {
  const user = useAuthStore((s) => s.user)
  const { status, setStatus, setLastSyncAt, setPendingCount } = useSyncStore()

  const syncNow = useCallback(async () => {
    if (!user || !isOnline()) return
    if (status === 'syncing') return

    setStatus('syncing')

    try {
      // Push local changes
      await pushChanges()

      // Pull remote changes
      const lastSync = useSyncStore.getState().lastSyncAt ?? undefined
      await pullChanges(user.id, lastSync)

      setLastSyncAt(new Date().toISOString())
      setStatus('synced')

      // Update pending count
      const count = await localDb.syncQueue.count()
      setPendingCount(count)
    } catch (error) {
      console.error('Sync failed:', error)
      setStatus('error')
    }
  }, [user, status, setStatus, setLastSyncAt, setPendingCount])

  // Auto-sync on mount and interval
  useEffect(() => {
    if (!user) return

    syncNow()

    const interval = setInterval(syncNow, 60000) // Sync every minute

    return () => clearInterval(interval)
  }, [user, syncNow])

  // Sync on online event
  useEffect(() => {
    const handleOnline = () => {
      syncNow()
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [syncNow])

  return { syncNow, status }
}

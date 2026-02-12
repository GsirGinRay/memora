import { localDb, type SyncQueueItem } from '@/lib/db/local-db'
import type { LocalCardScheduling } from '@/lib/db/local-db'

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error'

const API_ROUTES: Record<string, string> = {
  decks: '/api/decks',
  cards: '/api/cards',
  cardScheduling: '/api/study/review',
  reviewLogs: '/api/study/review',
}

async function syncItem(item: SyncQueueItem): Promise<void> {
  const baseRoute = API_ROUTES[item.table_name]
  if (!baseRoute) {
    throw new Error(`Unknown table: ${item.table_name}`)
  }

  if (item.operation === 'INSERT') {
    const res = await fetch(baseRoute, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item.data),
    })
    if (!res.ok) throw new Error(`Sync INSERT failed: ${res.status}`)
  } else if (item.operation === 'UPDATE') {
    const res = await fetch(`${baseRoute}/${item.record_id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item.data),
    })
    if (!res.ok) throw new Error(`Sync UPDATE failed: ${res.status}`)
  } else if (item.operation === 'DELETE') {
    const res = await fetch(`${baseRoute}/${item.record_id}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error(`Sync DELETE failed: ${res.status}`)
  }
}

export async function pushChanges(): Promise<number> {
  const items = await localDb.syncQueue.orderBy('created_at').toArray()

  if (items.length === 0) return 0

  let synced = 0

  for (const item of items) {
    try {
      await syncItem(item)
      await localDb.syncQueue.delete(item.id!)
      synced++
    } catch {
      // Skip failed items, retry on next sync
    }
  }

  return synced
}

export async function pullChanges(userId: string, lastSync?: string): Promise<void> {
  const since = lastSync ? `?since=${encodeURIComponent(lastSync)}` : ''

  // Pull decks
  const decksRes = await fetch(`/api/decks${since}`)
  if (decksRes.ok) {
    const decksData = await decksRes.json()
    if (Array.isArray(decksData) && decksData.length > 0) {
      await localDb.decks.bulkPut(decksData)
    }
  }

  // Pull cards - we need to iterate decks from local DB
  const localDecks = await localDb.decks
    .where('user_id')
    .equals(userId)
    .toArray()

  for (const deck of localDecks) {
    const cardsRes = await fetch(`/api/decks/${deck.id}/cards`)
    if (cardsRes.ok) {
      const cardsData = await cardsRes.json()
      if (Array.isArray(cardsData) && cardsData.length > 0) {
        await localDb.cards.bulkPut(cardsData)
      }
    }

    // Pull study queue (scheduling data)
    const schedRes = await fetch(`/api/study/${deck.id}`)
    if (schedRes.ok) {
      const schedData = await schedRes.json()
      if (Array.isArray(schedData) && schedData.length > 0) {
        const schedulingRecords = schedData.map(
          (item: { scheduling: LocalCardScheduling }) => item.scheduling
        )
        await localDb.cardScheduling.bulkPut(schedulingRecords)
      }
    }
  }
}

export async function addToSyncQueue(
  tableName: string,
  operation: SyncQueueItem['operation'],
  recordId: string,
  data: unknown
): Promise<void> {
  await localDb.syncQueue.add({
    table_name: tableName,
    operation,
    record_id: recordId,
    data,
    created_at: new Date().toISOString(),
  })
}

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true
}

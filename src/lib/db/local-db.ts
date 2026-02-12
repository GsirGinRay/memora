import Dexie, { type EntityTable } from 'dexie'

interface LocalDeck {
  id: string
  user_id: string
  name: string
  description: string | null
  color: string | null
  is_archived: boolean
  card_count: number
  new_count: number
  due_count: number
  created_at: string
  updated_at: string
}

interface LocalCard {
  id: string
  deck_id: string
  user_id: string
  card_type: string
  front: string
  back: string
  hint: string | null
  tags: string[]
  media_urls: string[]
  occlusion_data: unknown
  cloze_data: unknown
  created_at: string
  updated_at: string
}

interface LocalCardScheduling {
  id: string
  card_id: string
  user_id: string
  due: string
  stability: number
  difficulty: number
  elapsed_days: number
  scheduled_days: number
  reps: number
  lapses: number
  state: string
  last_review: string | null
  created_at: string
  updated_at: string
}

interface LocalReviewLog {
  id: string
  card_id: string
  user_id: string
  rating: number
  state: string
  due: string
  stability: number
  difficulty: number
  elapsed_days: number
  scheduled_days: number
  review_duration_ms: number | null
  reviewed_at: string
}

interface SyncQueueItem {
  id?: number
  table_name: string
  operation: 'INSERT' | 'UPDATE' | 'DELETE'
  record_id: string
  data: unknown
  created_at: string
}

class VocabMasterDB extends Dexie {
  decks!: EntityTable<LocalDeck, 'id'>
  cards!: EntityTable<LocalCard, 'id'>
  cardScheduling!: EntityTable<LocalCardScheduling, 'id'>
  reviewLogs!: EntityTable<LocalReviewLog, 'id'>
  syncQueue!: EntityTable<SyncQueueItem, 'id'>

  constructor() {
    super('VocabMasterDB')

    this.version(1).stores({
      decks: 'id, user_id, updated_at',
      cards: 'id, deck_id, user_id, updated_at',
      cardScheduling: 'id, card_id, user_id, due, state',
      reviewLogs: 'id, card_id, user_id, reviewed_at',
      syncQueue: '++id, table_name, created_at',
    })
  }
}

export const localDb = new VocabMasterDB()

export type {
  LocalDeck,
  LocalCard,
  LocalCardScheduling,
  LocalReviewLog,
  SyncQueueItem,
}

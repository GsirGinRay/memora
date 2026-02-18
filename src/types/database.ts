export interface AppUser {
  id: string
  email: string
  name?: string | null
  image?: string | null
}

export type CardType = 'basic' | 'cloze' | 'image_occlusion' | 'audio'
export type CardState = 'new' | 'learning' | 'review' | 'relearning'
export type Rating = 1 | 2 | 3 | 4 // Again, Hard, Good, Easy
export type QuizType = 'typing' | 'multiple_choice' | 'true_false' | 'matching' | 'spelling'

export interface Deck {
  id: string
  userId: string
  name: string
  description: string | null
  color: string | null
  isArchived: boolean
  cardCount: number
  newCount: number
  dueCount: number
  createdAt: string
  updatedAt: string
}

export interface Card {
  id: string
  deckId: string
  userId: string
  cardType: CardType
  front: string
  back: string
  hint: string | null
  tags: string[]
  mediaUrls: string[]
  media: CardMedia | null
  occlusionData: OcclusionRect[] | null
  clozeData: ClozeData | null
  createdAt: string
  updatedAt: string
}

export interface CardScheduling {
  id: string
  cardId: string
  userId: string
  due: string
  stability: number
  difficulty: number
  elapsedDays: number
  scheduledDays: number
  reps: number
  lapses: number
  state: CardState
  lastReview: string | null
  createdAt: string
  updatedAt: string
}

export interface OcclusionRect {
  id: string
  x: number
  y: number
  width: number
  height: number
  label: string
}

export type CustomStudyMode = 'all' | 'failed' | 'tags' | 'ahead'

export interface CardMedia {
  front?: { imageUrl?: string; audioUrl?: string }
  back?: { imageUrl?: string; audioUrl?: string }
  tts?: { enabled: boolean; lang: 'en' | 'zh-TW' }
}

export interface ClozeData {
  template: string
  deletions: ClozeDeletion[]
}

export interface ClozeDeletion {
  index: number
  answer: string
  hint: string | null
}

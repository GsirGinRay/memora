export type CardType = 'basic' | 'cloze' | 'image_occlusion' | 'audio'
export type CardState = 'new' | 'learning' | 'review' | 'relearning'
export type Rating = 1 | 2 | 3 | 4 // Again, Hard, Good, Easy
export type QuizType = 'typing' | 'multiple_choice' | 'true_false' | 'matching' | 'spelling'

export interface Profile {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  preferred_locale: string
  daily_new_limit: number
  daily_review_limit: number
  created_at: string
  updated_at: string
}

export interface Deck {
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

export interface Card {
  id: string
  deck_id: string
  user_id: string
  card_type: CardType
  front: string
  back: string
  hint: string | null
  tags: string[]
  media_urls: string[]
  occlusion_data: OcclusionRect[] | null
  cloze_data: ClozeData | null
  created_at: string
  updated_at: string
}

export interface CardScheduling {
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
  state: CardState
  last_review: string | null
  created_at: string
  updated_at: string
}

export interface ReviewLog {
  id: string
  card_id: string
  user_id: string
  rating: Rating
  state: CardState
  due: string
  stability: number
  difficulty: number
  elapsed_days: number
  scheduled_days: number
  review_duration_ms: number | null
  reviewed_at: string
}

export interface QuizSession {
  id: string
  user_id: string
  deck_id: string
  quiz_type: QuizType
  total_questions: number
  correct_count: number
  score: number
  started_at: string
  finished_at: string | null
}

export interface QuizAnswer {
  id: string
  session_id: string
  card_id: string
  user_answer: string
  correct_answer: string
  is_correct: boolean
  response_time_ms: number | null
  created_at: string
}

export interface CardMedia {
  id: string
  card_id: string
  user_id: string
  file_path: string
  file_type: string
  file_size: number
  created_at: string
}

export interface OcclusionRect {
  id: string
  x: number
  y: number
  width: number
  height: number
  label: string
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

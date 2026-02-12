import {
  fsrs,
  generatorParameters,
  type Card as FSRSCard,
  type Grade,
  Rating,
  State,
} from 'ts-fsrs'
import type { CardScheduling, CardState, Rating as AppRating } from '@/types/database'

const params = generatorParameters()
const scheduler = fsrs(params)

// Map DB state to FSRS State
function toFSRSState(state: CardState): State {
  const map: Record<CardState, State> = {
    new: State.New,
    learning: State.Learning,
    review: State.Review,
    relearning: State.Relearning,
  }
  return map[state]
}

// Map FSRS State to DB state
function fromFSRSState(state: State): CardState {
  const map: Record<State, CardState> = {
    [State.New]: 'new',
    [State.Learning]: 'learning',
    [State.Review]: 'review',
    [State.Relearning]: 'relearning',
  }
  return map[state]
}

// Map app rating (1-4) to FSRS Grade
function toFSRSGrade(rating: AppRating): Grade {
  const map: Record<AppRating, Grade> = {
    1: Rating.Again,
    2: Rating.Hard,
    3: Rating.Good,
    4: Rating.Easy,
  }
  return map[rating]
}

// Convert DB scheduling to FSRS Card object
export function toFSRSCard(scheduling: CardScheduling): FSRSCard {
  return {
    due: new Date(scheduling.due),
    stability: scheduling.stability,
    difficulty: scheduling.difficulty,
    elapsed_days: scheduling.elapsedDays,
    scheduled_days: scheduling.scheduledDays,
    reps: scheduling.reps,
    lapses: scheduling.lapses,
    learning_steps: 0,
    state: toFSRSState(scheduling.state),
    last_review: scheduling.lastReview
      ? new Date(scheduling.lastReview)
      : undefined,
  }
}

// Convert FSRS Card back to DB scheduling fields
export function fromFSRSCard(card: FSRSCard): Partial<CardScheduling> {
  return {
    due: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsedDays: card.elapsed_days,
    scheduledDays: card.scheduled_days,
    reps: card.reps,
    lapses: card.lapses,
    state: fromFSRSState(card.state),
    lastReview: card.last_review?.toISOString() ?? null,
  }
}

export interface SchedulingOption {
  rating: AppRating
  label: string
  interval: string
  card: FSRSCard
}

// Get all 4 rating options with previewed intervals
export function getSchedulingOptions(
  scheduling: CardScheduling,
  now: Date = new Date()
): SchedulingOption[] {
  const card = toFSRSCard(scheduling)
  const result = scheduler.repeat(card, now)

  const ratings: { rating: AppRating; label: string; grade: Grade }[] = [
    { rating: 1, label: 'Again', grade: Rating.Again },
    { rating: 2, label: 'Hard', grade: Rating.Hard },
    { rating: 3, label: 'Good', grade: Rating.Good },
    { rating: 4, label: 'Easy', grade: Rating.Easy },
  ]

  return ratings.map(({ rating, label, grade }) => {
    const scheduled = result[grade]
    return {
      rating,
      label,
      interval: formatInterval(scheduled.card.due, now),
      card: scheduled.card,
    }
  })
}

// Schedule a card with a specific rating
export function scheduleCard(
  scheduling: CardScheduling,
  rating: AppRating,
  now: Date = new Date()
): { updatedScheduling: Partial<CardScheduling>; reviewLog: object } {
  const card = toFSRSCard(scheduling)
  const grade = toFSRSGrade(rating)
  const result = scheduler.repeat(card, now)
  const scheduled = result[grade]

  return {
    updatedScheduling: fromFSRSCard(scheduled.card),
    reviewLog: scheduled.log,
  }
}

// Format interval for display
function formatInterval(due: Date, now: Date): string {
  const diffMs = due.getTime() - now.getTime()
  const diffMin = Math.round(diffMs / 60000)
  const diffHour = Math.round(diffMs / 3600000)
  const diffDay = Math.round(diffMs / 86400000)

  if (diffMin < 1) return '<1m'
  if (diffMin < 60) return `${diffMin}m`
  if (diffHour < 24) return `${diffHour}h`
  if (diffDay < 30) return `${diffDay}d`
  if (diffDay < 365) return `${Math.round(diffDay / 30)}mo`
  return `${(diffDay / 365).toFixed(1)}y`
}

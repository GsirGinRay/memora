import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  real,
  jsonb,
  primaryKey,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import type { AdapterAccountType } from 'next-auth/adapters'

// ─── Auth.js tables ─────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name'),
  email: text('email').unique().notNull(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  passwordHash: text('password_hash'),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
})

export const accounts = pgTable(
  'accounts',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
)

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ]
)

// ─── App tables ─────────────────────────────────────────

export const profiles = pgTable('profiles', {
  id: uuid('id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  displayName: text('display_name'),
  avatarUrl: text('avatar_url'),
  preferredLocale: varchar('preferred_locale', { length: 10 }).default('zh-TW').notNull(),
  dailyNewLimit: integer('daily_new_limit').default(20).notNull(),
  dailyReviewLimit: integer('daily_review_limit').default(200).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
})

export const decks = pgTable('decks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  color: varchar('color', { length: 20 }).default('#6366f1'),
  isArchived: boolean('is_archived').default(false).notNull(),
  cardCount: integer('card_count').default(0).notNull(),
  newCount: integer('new_count').default(0).notNull(),
  dueCount: integer('due_count').default(0).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
})

export const cards = pgTable('cards', {
  id: uuid('id').defaultRandom().primaryKey(),
  deckId: uuid('deck_id')
    .notNull()
    .references(() => decks.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  cardType: varchar('card_type', { length: 20 }).default('basic').notNull(),
  front: text('front').notNull(),
  back: text('back').notNull(),
  hint: text('hint'),
  tags: jsonb('tags').$type<string[]>().default([]).notNull(),
  mediaUrls: jsonb('media_urls').$type<string[]>().default([]).notNull(),
  occlusionData: jsonb('occlusion_data'),
  clozeData: jsonb('cloze_data'),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
})

export const cardScheduling = pgTable('card_scheduling', {
  id: uuid('id').defaultRandom().primaryKey(),
  cardId: uuid('card_id')
    .notNull()
    .references(() => cards.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  due: timestamp('due', { mode: 'string' }).defaultNow().notNull(),
  stability: real('stability').default(0).notNull(),
  difficulty: real('difficulty').default(0).notNull(),
  elapsedDays: integer('elapsed_days').default(0).notNull(),
  scheduledDays: integer('scheduled_days').default(0).notNull(),
  reps: integer('reps').default(0).notNull(),
  lapses: integer('lapses').default(0).notNull(),
  state: varchar('state', { length: 20 }).default('new').notNull(),
  lastReview: timestamp('last_review', { mode: 'string' }),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
})

export const reviewLogs = pgTable('review_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  cardId: uuid('card_id')
    .notNull()
    .references(() => cards.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(),
  state: varchar('state', { length: 20 }).notNull(),
  due: timestamp('due', { mode: 'string' }).notNull(),
  stability: real('stability').notNull(),
  difficulty: real('difficulty').notNull(),
  elapsedDays: integer('elapsed_days').notNull(),
  scheduledDays: integer('scheduled_days').notNull(),
  reviewDurationMs: integer('review_duration_ms'),
  reviewedAt: timestamp('reviewed_at', { mode: 'string' }).defaultNow().notNull(),
})

export const quizSessions = pgTable('quiz_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  deckId: uuid('deck_id')
    .notNull()
    .references(() => decks.id, { onDelete: 'cascade' }),
  quizType: varchar('quiz_type', { length: 30 }).notNull(),
  totalQuestions: integer('total_questions').notNull(),
  correctCount: integer('correct_count').default(0).notNull(),
  score: real('score').default(0).notNull(),
  startedAt: timestamp('started_at', { mode: 'string' }).defaultNow().notNull(),
  finishedAt: timestamp('finished_at', { mode: 'string' }),
})

export const quizAnswers = pgTable('quiz_answers', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => quizSessions.id, { onDelete: 'cascade' }),
  cardId: uuid('card_id')
    .notNull()
    .references(() => cards.id, { onDelete: 'cascade' }),
  userAnswer: text('user_answer').notNull(),
  correctAnswer: text('correct_answer').notNull(),
  isCorrect: boolean('is_correct').notNull(),
  responseTimeMs: integer('response_time_ms'),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
})

export const cardMedia = pgTable('card_media', {
  id: uuid('id').defaultRandom().primaryKey(),
  cardId: uuid('card_id')
    .notNull()
    .references(() => cards.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  filePath: text('file_path').notNull(),
  fileType: varchar('file_type', { length: 50 }).notNull(),
  fileSize: integer('file_size').notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
})

// ─── Relations ──────────────────────────────────────────

export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  profile: one(profiles, { fields: [users.id], references: [profiles.id] }),
  decks: many(decks),
  cards: many(cards),
}))

export const decksRelations = relations(decks, ({ one, many }) => ({
  user: one(users, { fields: [decks.userId], references: [users.id] }),
  cards: many(cards),
}))

export const cardsRelations = relations(cards, ({ one, many }) => ({
  deck: one(decks, { fields: [cards.deckId], references: [decks.id] }),
  user: one(users, { fields: [cards.userId], references: [users.id] }),
  scheduling: one(cardScheduling, {
    fields: [cards.id],
    references: [cardScheduling.cardId],
  }),
  reviewLogs: many(reviewLogs),
}))

export const cardSchedulingRelations = relations(cardScheduling, ({ one }) => ({
  card: one(cards, { fields: [cardScheduling.cardId], references: [cards.id] }),
  user: one(users, { fields: [cardScheduling.userId], references: [users.id] }),
}))

export const reviewLogsRelations = relations(reviewLogs, ({ one }) => ({
  card: one(cards, { fields: [reviewLogs.cardId], references: [cards.id] }),
  user: one(users, { fields: [reviewLogs.userId], references: [users.id] }),
}))

export const quizSessionsRelations = relations(quizSessions, ({ one, many }) => ({
  user: one(users, { fields: [quizSessions.userId], references: [users.id] }),
  deck: one(decks, { fields: [quizSessions.deckId], references: [decks.id] }),
  answers: many(quizAnswers),
}))

export const quizAnswersRelations = relations(quizAnswers, ({ one }) => ({
  session: one(quizSessions, {
    fields: [quizAnswers.sessionId],
    references: [quizSessions.id],
  }),
  card: one(cards, { fields: [quizAnswers.cardId], references: [cards.id] }),
}))

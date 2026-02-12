'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { fetchJson } from '@/lib/api/fetch'
import { getSchedulingOptions } from '@/lib/fsrs/scheduler'
import type { Card, CardScheduling, Rating } from '@/types/database'

export interface StudyCard {
  card: Card
  scheduling: CardScheduling
}

export function useStudyQueue(deckId: string) {
  const user = useAuthStore((s) => s.user)

  return useQuery({
    queryKey: ['study-queue', deckId, user?.id],
    queryFn: () => fetchJson<StudyCard[]>(`/api/study/${deckId}`),
    enabled: !!user && !!deckId,
  })
}

export function useSubmitReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      scheduling,
      rating,
      durationMs,
    }: {
      scheduling: CardScheduling
      rating: Rating
      durationMs: number
    }) =>
      fetchJson<{ success: boolean }>('/api/study/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduling, rating, durationMs }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-queue'] })
      queryClient.invalidateQueries({ queryKey: ['decks'] })
    },
  })
}

export { getSchedulingOptions }

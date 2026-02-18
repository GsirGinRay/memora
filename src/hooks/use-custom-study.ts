'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { fetchJson } from '@/lib/api/fetch'
import type { CustomStudyMode } from '@/types/database'
import type { StudyCard } from '@/hooks/use-study'

interface CustomStudyParams {
  mode: CustomStudyMode
  tags?: string[]
}

export function useCustomStudyQueue(deckId: string, params: CustomStudyParams | null) {
  const user = useAuthStore((s) => s.user)

  return useQuery({
    queryKey: ['custom-study', deckId, params],
    queryFn: () => {
      const searchParams = new URLSearchParams()
      if (params) {
        searchParams.set('mode', params.mode)
        if (params.tags && params.tags.length > 0) {
          searchParams.set('tags', params.tags.join(','))
        }
      }
      return fetchJson<StudyCard[]>(`/api/study/${deckId}/custom?${searchParams.toString()}`)
    },
    enabled: !!user && !!deckId && !!params,
  })
}

export function useDeckTags(deckId: string) {
  const user = useAuthStore((s) => s.user)

  return useQuery({
    queryKey: ['deck-tags', deckId],
    queryFn: () => fetchJson<string[]>(`/api/decks/${deckId}/tags`),
    enabled: !!user && !!deckId,
  })
}

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { fetchJson } from '@/lib/api/fetch'
import type { Card, CardType, OcclusionRect } from '@/types/database'
import { toast } from 'sonner'

export function useCards(deckId: string) {
  const user = useAuthStore((s) => s.user)

  return useQuery({
    queryKey: ['cards', deckId],
    queryFn: () => fetchJson<Card[]>(`/api/decks/${deckId}/cards`),
    enabled: !!user && !!deckId,
  })
}

interface CreateCardInput {
  deckId: string
  cardType: CardType
  front: string
  back: string
  hint?: string
  tags?: string[]
  clozeData?: Card['clozeData']
  mediaUrls?: string[]
  occlusionData?: OcclusionRect[]
}

function toSnakeCaseBody(input: CreateCardInput) {
  return {
    card_type: input.cardType,
    front: input.front,
    back: input.back,
    hint: input.hint,
    tags: input.tags,
    cloze_data: input.clozeData,
    media_urls: input.mediaUrls,
    occlusion_data: input.occlusionData,
  }
}

export function useCreateCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateCardInput) =>
      fetchJson<Card>(`/api/decks/${input.deckId}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toSnakeCaseBody(input)),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cards', variables.deckId] })
      queryClient.invalidateQueries({ queryKey: ['decks'] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { id: string; deckId: string } & Partial<CreateCardInput>) => {
      const { id, deckId, ...updates } = input
      const snakeBody: Record<string, unknown> = {}
      if (updates.cardType !== undefined) snakeBody.card_type = updates.cardType
      if (updates.front !== undefined) snakeBody.front = updates.front
      if (updates.back !== undefined) snakeBody.back = updates.back
      if (updates.hint !== undefined) snakeBody.hint = updates.hint
      if (updates.tags !== undefined) snakeBody.tags = updates.tags
      if (updates.clozeData !== undefined) snakeBody.cloze_data = updates.clozeData
      if (updates.mediaUrls !== undefined) snakeBody.media_urls = updates.mediaUrls
      if (updates.occlusionData !== undefined) snakeBody.occlusion_data = updates.occlusionData

      const card = await fetchJson<Card>(`/api/cards/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(snakeBody),
      })
      return { card, deckId }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['cards', result.deckId] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, deckId }: { id: string; deckId: string }) => {
      await fetchJson<{ success: boolean }>(`/api/cards/${id}`, { method: 'DELETE' })
      return deckId
    },
    onSuccess: (deckId) => {
      queryClient.invalidateQueries({ queryKey: ['cards', deckId] })
      queryClient.invalidateQueries({ queryKey: ['decks'] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

interface ImageOcclusionInput {
  deckId: string
  imageUrl: string
  rects: OcclusionRect[]
  tags?: string[]
}

export function useCreateImageOcclusionCards() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: ImageOcclusionInput) => {
      const promises = input.rects.map((rect) =>
        fetchJson<Card>(`/api/decks/${input.deckId}/cards`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            card_type: 'image_occlusion',
            front: rect.id,
            back: rect.label,
            tags: input.tags ?? [],
            media_urls: [input.imageUrl],
            occlusion_data: input.rects,
          }),
        })
      )
      return Promise.all(promises)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cards', variables.deckId] })
      queryClient.invalidateQueries({ queryKey: ['decks'] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

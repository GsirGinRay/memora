'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import type { Card, CardType } from '@/types/database'
import { toast } from 'sonner'

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? `Request failed: ${res.status}`)
  }
  return res.json()
}

export function useCards(deckId: string) {
  const user = useAuthStore((s) => s.user)

  return useQuery({
    queryKey: ['cards', deckId],
    queryFn: () => fetchJson<Card[]>(`/api/decks/${deckId}/cards`),
    enabled: !!user && !!deckId,
  })
}

interface CreateCardInput {
  deck_id: string
  card_type: CardType
  front: string
  back: string
  hint?: string
  tags?: string[]
  cloze_data?: Card['cloze_data']
  occlusion_data?: Card['occlusion_data']
  media_urls?: string[]
}

export function useCreateCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateCardInput) =>
      fetchJson<Card>(`/api/decks/${input.deck_id}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cards', variables.deck_id] })
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
    mutationFn: async (input: { id: string; deck_id: string } & Partial<CreateCardInput>) => {
      const { id, deck_id, ...updates } = input
      const card = await fetchJson<Card>(`/api/cards/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      return { card, deck_id }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['cards', result.deck_id] })
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

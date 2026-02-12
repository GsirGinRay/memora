'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { fetchJson } from '@/lib/api/fetch'
import type { Card, CardType } from '@/types/database'
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
}

export function useCreateCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateCardInput) =>
      fetchJson<Card>(`/api/decks/${input.deckId}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
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
      const card = await fetchJson<Card>(`/api/cards/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
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

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import type { Deck } from '@/types/database'
import { toast } from 'sonner'

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? `Request failed: ${res.status}`)
  }
  return res.json()
}

export function useDecks() {
  const user = useAuthStore((s) => s.user)

  return useQuery({
    queryKey: ['decks', user?.id],
    queryFn: () => fetchJson<Deck[]>('/api/decks'),
    enabled: !!user,
  })
}

export function useCreateDeck() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { name: string; description?: string; color?: string }) =>
      fetchJson<Deck>('/api/decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decks'] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateDeck() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { id: string; name?: string; description?: string; color?: string; is_archived?: boolean }) => {
      const { id, ...updates } = input
      return fetchJson<Deck>(`/api/decks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decks'] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteDeck() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      fetchJson<{ success: boolean }>(`/api/decks/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decks'] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

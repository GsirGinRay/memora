'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { fetchJson } from '@/lib/api/fetch'
import type { CardTemplate, TemplateBlock } from '@/types/card-template'
import { BUILT_IN_TEMPLATES } from '@/lib/templates/built-in'
import { toast } from 'sonner'

export function useTemplates() {
  const user = useAuthStore((s) => s.user)

  const query = useQuery({
    queryKey: ['templates'],
    queryFn: () => fetchJson<CardTemplate[]>('/api/templates'),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })

  return {
    ...query,
    data: query.data ?? BUILT_IN_TEMPLATES,
  }
}

interface CreateTemplateInput {
  name: string
  description?: string | null
  frontBlocks: TemplateBlock[]
  backBlocks: TemplateBlock[]
  tts?: { enabled: boolean; lang: 'en' | 'zh-TW' } | null
}

export function useCreateTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateTemplateInput) =>
      fetchJson<CardTemplate>('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: input.name,
          description: input.description,
          front_blocks: input.frontBlocks,
          back_blocks: input.backBlocks,
          tts: input.tts,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

interface UpdateTemplateInput {
  id: string
  name?: string
  description?: string | null
  frontBlocks?: TemplateBlock[]
  backBlocks?: TemplateBlock[]
  tts?: { enabled: boolean; lang: 'en' | 'zh-TW' } | null
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateTemplateInput) => {
      const { id, ...updates } = input
      const snakeBody: Record<string, unknown> = {}
      if (updates.name !== undefined) snakeBody.name = updates.name
      if (updates.description !== undefined) snakeBody.description = updates.description
      if (updates.frontBlocks !== undefined) snakeBody.front_blocks = updates.frontBlocks
      if (updates.backBlocks !== undefined) snakeBody.back_blocks = updates.backBlocks
      if (updates.tts !== undefined) snakeBody.tts = updates.tts

      return fetchJson<CardTemplate>(`/api/templates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(snakeBody),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await fetchJson<{ success: boolean }>(`/api/templates/${id}`, {
        method: 'DELETE',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

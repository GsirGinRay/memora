'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'

export interface DailyReviewStat {
  date: string
  count: number
  correctCount: number
}

export interface CardDistribution {
  state: string
  count: number
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? `Request failed: ${res.status}`)
  }
  return res.json()
}

export function useTodayStats() {
  const user = useAuthStore((s) => s.user)

  return useQuery({
    queryKey: ['stats-today', user?.id],
    queryFn: () =>
      fetchJson<{ totalReviews: number; correctCount: number; accuracy: number }>(
        '/api/stats/today'
      ),
    enabled: !!user,
  })
}

export function useReviewTrend(days: number = 30) {
  const user = useAuthStore((s) => s.user)

  return useQuery({
    queryKey: ['stats-trend', user?.id, days],
    queryFn: () =>
      fetchJson<DailyReviewStat[]>(`/api/stats/trend?days=${days}`),
    enabled: !!user,
  })
}

export function useCardDistribution() {
  const user = useAuthStore((s) => s.user)

  return useQuery({
    queryKey: ['stats-distribution', user?.id],
    queryFn: () => fetchJson<CardDistribution[]>('/api/stats/distribution'),
    enabled: !!user,
  })
}

export function useStreakDays() {
  const user = useAuthStore((s) => s.user)

  return useQuery({
    queryKey: ['stats-streak', user?.id],
    queryFn: async (): Promise<number> => {
      const data = await fetchJson<{ streak: number }>('/api/stats/streak')
      return data.streak
    },
    enabled: !!user,
  })
}

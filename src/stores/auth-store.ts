import { create } from 'zustand'

export interface AppUser {
  id: string
  email: string
  name?: string | null
  image?: string | null
}

interface AuthState {
  user: AppUser | null
  isLoading: boolean
  setUser: (user: AppUser | null) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}))

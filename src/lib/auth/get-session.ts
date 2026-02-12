import { auth } from './auth'
import type { AppUser } from '@/types/database'

export type { AppUser }

export async function requireAuth(): Promise<AppUser> {
  const session = await auth()
  if (!session?.user?.id || !session.user.email) {
    throw new Error('Unauthorized')
  }
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
  }
}

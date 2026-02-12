import { auth } from './auth'

export interface AppUser {
  id: string
  email: string
  name?: string | null
  image?: string | null
}

export async function getAuthenticatedUser(): Promise<AppUser | null> {
  const session = await auth()
  if (!session?.user?.id || !session.user.email) return null

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
  }
}

export async function requireAuth(): Promise<AppUser> {
  const user = await getAuthenticatedUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

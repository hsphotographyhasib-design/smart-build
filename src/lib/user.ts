// Shape a DB AppUser into a safe object for the client (never expose passwordHash).
export interface PublicUser {
  id: string
  name: string
  email: string
  role: string
  avatar: string | null
  phone: string | null
  provider: string
  active: boolean
  createdAt: string
}

export function publicUser(u: {
  id: string
  name: string
  email: string
  role: string
  avatar?: string | null
  phone?: string | null
  provider: string
  active: boolean
  createdAt: Date | string
}): PublicUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatar: u.avatar ?? null,
    phone: u.phone ?? null,
    provider: u.provider,
    active: u.active,
    createdAt: typeof u.createdAt === 'string' ? u.createdAt : u.createdAt.toISOString(),
  }
}

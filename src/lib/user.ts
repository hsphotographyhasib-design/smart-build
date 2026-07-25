// Shape a DB AppUser into a safe object for the client.
export interface PublicUser {
  id: string
  name: string
  email: string
  role: string
  roleLevel: number
  avatar: string | null
  phone: string | null
  provider: string
  tenantId: string | null
  branchId: string | null
  tenant: { id: string; slug: string; name: string; status: string; tier: string } | null
  permissions: string[]
}

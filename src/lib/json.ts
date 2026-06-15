import { Prisma } from '@prisma/client'

// Prisma model instances contain getter functions that can't be serialized.
// Use this helper to safely serialize Prisma results for API responses.
export function safeJson<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T
}

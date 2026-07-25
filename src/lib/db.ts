import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const dbUrl = process.env.DATABASE_URL || 'file:db/custom.db'

  // If using libsql:// or turso:// URL, use the libSQL adapter
  if (dbUrl.startsWith('libsql://') || dbUrl.startsWith('turso://')) {
    const adapter = new PrismaLibSQL({
      url: dbUrl,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    })
    return new PrismaClient({ adapter, log: ['error', 'warn'] })
  }

  // Local SQLite (file:) — use default Prisma client
  return new PrismaClient({ log: ['error', 'warn'] })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

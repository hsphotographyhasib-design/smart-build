// One-off: create/refresh a demo Super Admin login. Run: bun prisma/create-admin.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

const EMAIL = 'admin@hjsb.com'
const PASSWORD = 'admin123'

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 10)
  const existing = await db.appUser.findFirst({ where: { email: EMAIL, tenantId: null } })
  let user
  if (existing) {
    user = await db.appUser.update({ where: { id: existing.id }, data: { passwordHash, role: 'Super Admin', active: true, provider: 'email' } })
  } else {
    user = await db.appUser.create({
      data: {
        name: 'Site Administrator',
        email: EMAIL,
        role: 'Super Admin',
        provider: 'email',
        passwordHash,
      },
    })
  }
  console.log(`✓ Super Admin ready: ${user.email} / ${PASSWORD} (role: ${user.role})`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())

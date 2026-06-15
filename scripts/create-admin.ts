import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)
  try {
    const user = await db.user.create({
      data: {
        email: 'admin@smartbuild.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin',
        isActive: true,
        phone: '+6738881234',
      },
    })
    console.log('Created admin:', user.id, user.email)
    
    // Create notification prefs
    await db.notificationPreference.create({
      data: { userId: user.id }
    })
    
    // Create demo user
    const demoHashed = await bcrypt.hash('demo123', 10)
    const demo = await db.user.create({
      data: {
        email: 'demo@smartbuild.com',
        password: demoHashed,
        name: 'Demo User',
        role: 'supervisor',
        isActive: true,
        phone: '+6738885678',
      },
    })
    console.log('Created demo:', demo.id, demo.email)
    await db.notificationPreference.create({
      data: { userId: demo.id }
    })
  } catch (e: any) {
    console.error('Error:', e.message)
  }
  await db.$disconnect()
}

main()

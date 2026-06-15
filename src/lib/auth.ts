import { db } from '@/lib/db'
import { NextRequest } from 'next/server'
import crypto from 'crypto'

export type AuthUser = {
  id: string
  email: string
  name: string
  phone: string | null
  avatar: string | null
  role: string
  isActive: boolean
}

/**
 * অনুরোধ হেডার থেকে প্রমাণীকরণ যাচাই করা হচ্ছে।
 * Authorization: Bearer <token> হেডার খোঁজা হচ্ছে,
 * সেশন যাচাই করা হচ্ছে, এবং ব্যবহারকারী বা null প্রদান করা হচ্ছে।
 */
export async function verifyAuth(request: NextRequest): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.slice(7)
    if (!token) {
      return null
    }

    const session = await db.session.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!session) {
      return null
    }

    // সেশন বাতিল করা হয়েছে কিনা পরীক্ষা করা হচ্ছে
    if (session.revokedAt) {
      return null
    }

    // সেশনের মেয়াদ উত্তীর্ণ হয়েছে কিনা পরীক্ষা করা হচ্ছে
    if (new Date() > session.expiresAt) {
      return null
    }

    // ব্যবহারকারী সক্রিয় কিনা পরীক্ষা করা হচ্ছে
    if (!session.user.isActive) {
      return null
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      phone: session.user.phone,
      avatar: session.user.avatar,
      role: session.user.role,
      isActive: session.user.isActive,
    }
  } catch {
    return null
  }
}

/**
 * ব্যবহারকারীর নিকট প্রয়োজনীয় ভূমিকাগুলোর মধ্যে একটি আছে কিনা পরীক্ষা করা হচ্ছে।
 * ব্যবহারকারীর ভূমিকা যদি roles অ্যারের যেকোনো একটির সাথে মিলে যায় তবে true প্রদান করে।
 */
export function requireRole(user: AuthUser | null, roles: string[]): boolean {
  if (!user) return false
  // সুপার অ্যাডমিনের সবকিছুতে অ্যাক্সেস আছে
  if (user.role === 'super_admin') return true
  // অ্যাডমিন যেকোনো অ্যাডমিন-স্তরের রাউটে অ্যাক্সেস করতে পারে
  if (user.role === 'admin') return true
  return roles.includes(user.role)
}

/**
 * ডাটাবেজে নতুন সেশন তৈরি করা হচ্ছে।
 * একটি UUID টোকেন তৈরি করা হচ্ছে এবং মেয়াদ ৭ দিন পর নির্ধারণ করা হচ্ছে।
 */
export async function createSession(
  userId: string,
  meta?: {
    device?: string
    ipAddress?: string
    userAgent?: string
  }
): Promise<{ token: string; expiresAt: Date }> {
  const token = crypto.randomUUID()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // ৭ দিন

  await db.session.create({
    data: {
      userId,
      token,
      expiresAt,
      device: meta?.device,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    },
  })

  // সর্বশেষ লগইন আপডেট করা হচ্ছে
  await db.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  })

  return { token, expiresAt }
}

/**
 * টোকেন দিয়ে একটি সেশন বাতিল করা হচ্ছে।
 * revokedAt টাইমস্ট্যাম্প নির্ধারণ করা হচ্ছে।
 */
export async function revokeSession(token: string): Promise<boolean> {
  try {
    const session = await db.session.findUnique({
      where: { token },
    })

    if (!session || session.revokedAt) {
      return false
    }

    await db.session.update({
      where: { token },
      data: { revokedAt: new Date() },
    })

    return true
  } catch {
    return false
  }
}

/**
 * একটি অডিট লগ এন্ট্রি তৈরি করা হচ্ছে।
 */
export async function createAuditLog(params: {
  userId?: string
  action: string
  entity: string
  entityId?: string
  oldValues?: unknown
  newValues?: unknown
  ipAddress?: string
}): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        oldValues: params.oldValues ? JSON.stringify(params.oldValues) : null,
        newValues: params.newValues ? JSON.stringify(params.newValues) : null,
        ipAddress: params.ipAddress,
      },
    })
  } catch {
    // অডিট লগ তৈরি করতে ব্যর্থ হলে মূল কার্যক্রম বন্ধ হবে না
  }
}

/**
 * হার সীমাবদ্ধকারী - প্রতি IP তে সাধারণ ইন-মেমরি কাউন্টার।
 * অনুরোধটি হার-সীমাবদ্ধ (ব্লক করা উচিত) হলে true প্রদান করে।
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // ১ মিনিট
const RATE_LIMIT_MAX = 20 // প্রতি মিনিটে ২০টি অনুরোধ

export function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }

  record.count++
  return record.count > RATE_LIMIT_MAX
}

// প্রতি ৫ মিনিটে পুরনো হার সীমাবদ্ধতার এন্ট্রি পরিষ্কার করা হচ্ছে
setInterval(() => {
  const now = Date.now()
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetAt) {
      rateLimitMap.delete(ip)
    }
  }
}, 5 * 60 * 1000)
/**
 * Centralized Enterprise Notification Engine.
 * Creates & updates DB notification records with atomic Prisma transactions, audit logging,
 * and pushes real-time updates via SSE.
 */
import { db } from '@/lib/db'
import { sseRegistry } from '@/lib/sse-registry'

export interface CreateNotificationInput {
  userId: string
  type: string
  title: string
  message: string
  link?: string
  category?: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  companyId?: string
  branchId?: string
  module?: string
  referenceType?: string
  referenceId?: string
  createdBy?: string
  data?: Record<string, unknown>
  expiresAt?: Date
}

export interface ReadActionContext {
  id: string
  userId: string
  ipAddress?: string | null
  browser?: string | null
  deviceId?: string | null
}

export interface ReadAllActionContext {
  userId: string
  ipAddress?: string | null
  browser?: string | null
  deviceId?: string | null
}

/** Create a new notification record in DB and push real-time event */
export async function createNotification(input: CreateNotificationInput): Promise<void> {
  try {
    const notification = await db.notification.create({
      data: {
        userId:        input.userId,
        type:          input.type,
        title:         input.title,
        message:       input.message,
        link:          input.link ?? null,
        category:      input.category ?? null,
        priority:      input.priority ?? 'normal',
        companyId:     input.companyId ?? null,
        branchId:      input.branchId ?? null,
        module:        input.module ?? input.category ?? null,
        referenceType: input.referenceType ?? null,
        referenceId:   input.referenceId ?? null,
        createdBy:     input.createdBy ?? null,
        data:          input.data ? JSON.stringify(input.data) : null,
        expiresAt:     input.expiresAt ?? null,
      },
    })

    const unreadCount = await getUnreadCount(input.userId)

    // Push to connected SSE clients immediately
    sseRegistry.sendToUser(input.userId, {
      type:        'notification',
      id:          notification.id,
      notifType:   input.type,
      title:       input.title,
      message:     input.message,
      link:        input.link,
      category:    input.category,
      priority:    input.priority ?? 'normal',
      isRead:      false,
      createdAt:   notification.createdAt.toISOString(),
      unreadCount,
    })
  } catch (err) {
    console.error('[Notifications] Failed to create notification:', err)
  }
}

/** Get exact unread count for user directly from DB */
export async function getUnreadCount(userId: string): Promise<number> {
  return await db.notification.count({
    where: {
      userId,
      isRead: false,
      deletedAt: null,
    },
  })
}

/** Get user's notifications with pagination & filtering */
export async function getUserNotifications(options: {
  userId: string
  page?: number
  limit?: number
  unreadOnly?: boolean
  module?: string
}) {
  const page = Math.max(1, options.page || 1)
  const limit = Math.min(100, Math.max(1, options.limit || 20))
  const skip = (page - 1) * limit

  const where: any = {
    userId: options.userId,
    deletedAt: null,
  }

  if (options.unreadOnly) {
    where.isRead = false
  }

  if (options.module) {
    where.module = options.module
  }

  const [notifications, total, unreadCount] = await Promise.all([
    db.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        link: true,
        category: true,
        priority: true,
        module: true,
        companyId: true,
        branchId: true,
        referenceType: true,
        referenceId: true,
        createdBy: true,
        data: true,
        isRead: true,
        readAt: true,
        clickedAt: true,
        createdAt: true,
      },
    }),
    db.notification.count({ where }),
    getUnreadCount(options.userId),
  ])

  return {
    notifications,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
    unreadCount,
  }
}

/** Mark a single notification as read using atomic transaction */
export async function markNotificationRead(ctx: ReadActionContext) {
  const now = new Date()

  return await db.$transaction(async (tx) => {
    // 1. Verify ownership & existence
    const notification = await tx.notification.findFirst({
      where: { id: ctx.id, userId: ctx.userId, deletedAt: null },
    })

    if (!notification) {
      throw new Error('Notification not found or access denied')
    }

    // 2. Update Notification DB record permanently
    const updated = await tx.notification.update({
      where: { id: ctx.id },
      data: {
        isRead: true,
        readAt: now,
        clickedAt: now,
      },
    })

    // 3. Upsert detailed read tracking
    await tx.notificationRead.create({
      data: {
        notificationId: ctx.id,
        userId: ctx.userId,
        read: true,
        readAt: now,
        clickedAt: now,
        ipAddress: ctx.ipAddress ?? null,
        browser: ctx.browser ?? null,
        deviceId: ctx.deviceId ?? null,
      },
    })

    // 4. Calculate updated DB unread count
    const unreadCount = await tx.notification.count({
      where: { userId: ctx.userId, isRead: false, deletedAt: null },
    })

    // 5. Write audit log
    await tx.auditLog.create({
      data: {
        userId: ctx.userId,
        action: 'NOTIFICATION_READ',
        entity: 'Notification',
        entityId: ctx.id,
        newValues: JSON.stringify({
          isRead: true,
          readAt: now.toISOString(),
          ipAddress: ctx.ipAddress,
          browser: ctx.browser,
          deviceId: ctx.deviceId,
        }),
      },
    })

    // 6. Broadcast real-time update
    sseRegistry.sendToUser(ctx.userId, {
      type: 'notification_read',
      id: ctx.id,
      isRead: true,
      readAt: now.toISOString(),
      unreadCount,
    })

    return { notification: updated, unreadCount }
  })
}

/** Mark all notifications as read for a user using atomic transaction */
export async function markAllNotificationsRead(ctx: ReadAllActionContext) {
  const now = new Date()

  return await db.$transaction(async (tx) => {
    const unreadNotifications = await tx.notification.findMany({
      where: { userId: ctx.userId, isRead: false, deletedAt: null },
      select: { id: true },
    })

    if (unreadNotifications.length > 0) {
      // 1. Bulk update notifications
      await tx.notification.updateMany({
        where: { userId: ctx.userId, isRead: false, deletedAt: null },
        data: {
          isRead: true,
          readAt: now,
        },
      })

      // 2. Insert read records
      await tx.notificationRead.createMany({
        data: unreadNotifications.map((n) => ({
          notificationId: n.id,
          userId: ctx.userId,
          read: true,
          readAt: now,
          ipAddress: ctx.ipAddress ?? null,
          browser: ctx.browser ?? null,
          deviceId: ctx.deviceId ?? null,
        })),
      })

      // 3. Write bulk audit log
      await tx.auditLog.create({
        data: {
          userId: ctx.userId,
          action: 'NOTIFICATION_READ_ALL',
          entity: 'Notification',
          entityId: 'ALL',
          newValues: JSON.stringify({
            count: unreadNotifications.length,
            readAt: now.toISOString(),
            ipAddress: ctx.ipAddress,
            browser: ctx.browser,
          }),
        },
      })
    }

    // 4. Broadcast real-time update
    sseRegistry.sendToUser(ctx.userId, {
      type: 'notification_read_all',
      isRead: true,
      unreadCount: 0,
    })

    return { updatedCount: unreadNotifications.length, unreadCount: 0 }
  })
}

/** Mark notification as unread using atomic transaction */
export async function markNotificationUnread(ctx: ReadActionContext) {
  return await db.$transaction(async (tx) => {
    const notification = await tx.notification.findFirst({
      where: { id: ctx.id, userId: ctx.userId, deletedAt: null },
    })

    if (!notification) {
      throw new Error('Notification not found or access denied')
    }

    const updated = await tx.notification.update({
      where: { id: ctx.id },
      data: {
        isRead: false,
        readAt: null,
      },
    })

    const unreadCount = await tx.notification.count({
      where: { userId: ctx.userId, isRead: false, deletedAt: null },
    })

    await tx.auditLog.create({
      data: {
        userId: ctx.userId,
        action: 'NOTIFICATION_UNREAD',
        entity: 'Notification',
        entityId: ctx.id,
        newValues: JSON.stringify({
          isRead: false,
          ipAddress: ctx.ipAddress,
          browser: ctx.browser,
        }),
      },
    })

    sseRegistry.sendToUser(ctx.userId, {
      type: 'notification_unread',
      id: ctx.id,
      isRead: false,
      unreadCount,
    })

    return { notification: updated, unreadCount }
  })
}

/** Delete a notification (soft-delete in DB) using atomic transaction */
export async function deleteNotification(ctx: ReadActionContext) {
  const now = new Date()

  return await db.$transaction(async (tx) => {
    const notification = await tx.notification.findFirst({
      where: { id: ctx.id, userId: ctx.userId, deletedAt: null },
    })

    if (!notification) {
      throw new Error('Notification not found or access denied')
    }

    await tx.notification.update({
      where: { id: ctx.id },
      data: { deletedAt: now },
    })

    const unreadCount = await tx.notification.count({
      where: { userId: ctx.userId, isRead: false, deletedAt: null },
    })

    await tx.auditLog.create({
      data: {
        userId: ctx.userId,
        action: 'NOTIFICATION_DELETED',
        entity: 'Notification',
        entityId: ctx.id,
        newValues: JSON.stringify({
          deletedAt: now.toISOString(),
          ipAddress: ctx.ipAddress,
        }),
      },
    })

    sseRegistry.sendToUser(ctx.userId, {
      type: 'notification_deleted',
      id: ctx.id,
      unreadCount,
    })

    return { id: ctx.id, unreadCount }
  })
}

/** Broadcast notification to multiple users */
export async function broadcastNotification(
  userIds: string[],
  input: Omit<CreateNotificationInput, 'userId'>
): Promise<void> {
  await Promise.allSettled(userIds.map((userId) => createNotification({ ...input, userId })))
}

/** Create notification for users matching a role */
export async function notifyRole(
  role: string,
  input: Omit<CreateNotificationInput, 'userId'>
): Promise<void> {
  try {
    const users = await db.user.findMany({
      where: { role, isActive: true },
      select: { id: true },
    })
    await broadcastNotification(users.map((u) => u.id), input)
  } catch (err) {
    console.error('[Notifications] notifyRole failed:', err)
  }
}

/** Notify all admins + super_admins */
export async function notifyAdmins(input: Omit<CreateNotificationInput, 'userId'>): Promise<void> {
  await notifyRole('admin', input)
  await notifyRole('super_admin', input)
}

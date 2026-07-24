import { db } from '../../src/lib/db'
import {
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markNotificationRead,
  markNotificationUnread,
  markAllNotificationsRead,
  deleteNotification,
} from '../../src/lib/notifications'

async function runNotificationPersistenceTests() {
  console.log('🧪 Starting Enterprise Notification Read Status Persistence Tests...\n')

  let testUserId = 'test-user-persistence-id'
  const createdUser = await db.user.findFirst()
  if (createdUser) {
    testUserId = createdUser.id
  }

  const testNotifTitle = `Test Notif Persistence ${Date.now()}`

  // 1. Create Notification
  console.log('Step 1: Creating notification in DB...')
  await createNotification({
    userId: testUserId,
    type: 'system',
    title: testNotifTitle,
    message: 'Testing notification read status persistence',
    priority: 'high',
  })

  // 2. Fetch Notifications
  console.log('Step 2: Fetching notifications from DB...')
  const initialFetch = await getUserNotifications({ userId: testUserId })
  const notif = initialFetch.notifications.find((n) => n.title === testNotifTitle)

  if (!notif) {
    throw new Error('❌ Notification was not created in DB!')
  }
  if (notif.isRead !== false) {
    throw new Error('❌ New notification should be unread (isRead = false)!')
  }
  console.log('✓ Verified notification created as UNREAD in DB.')

  // 3. Mark as Read
  console.log('Step 3: Marking notification as READ...')
  const markReadRes = await markNotificationRead({
    id: notif.id,
    userId: testUserId,
    ipAddress: '127.0.0.1',
    browser: 'TestBrowser/1.0',
    deviceId: 'test-device-uuid',
  })

  if (!markReadRes.notification.isRead || !markReadRes.notification.readAt) {
    throw new Error('❌ markNotificationRead failed to update isRead and readAt in DB!')
  }
  console.log('✓ Marked as READ in DB with timestamp:', markReadRes.notification.readAt)

  // 4. Verify Persistence (Simulating Page Refresh / New Session)
  console.log('Step 4: Simulating page refresh & fetching fresh state from DB...')
  const refreshedFetch = await getUserNotifications({ userId: testUserId })
  const refreshedNotif = refreshedFetch.notifications.find((n) => n.id === notif.id)

  if (!refreshedNotif || refreshedNotif.isRead !== true) {
    throw new Error('❌ CRITICAL BUG: Notification reverted to UNREAD after DB re-query!')
  }
  console.log('✓ SUCCESS: Notification read status PERMANENTLY SAVED in DB!')

  // 5. Verify Audit Log entry
  console.log('Step 5: Verifying AuditLog entry...')
  const auditLog = await db.auditLog.findFirst({
    where: {
      userId: testUserId,
      entity: 'Notification',
      entityId: notif.id,
      action: 'NOTIFICATION_READ',
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!auditLog) {
    throw new Error('❌ AuditLog entry was not created!')
  }
  console.log('✓ Verified AuditLog entry created:', auditLog.action)

  // 6. Verify NotificationRead tracking record
  console.log('Step 6: Verifying NotificationRead tracking record...')
  const readTracking = await db.notificationRead.findFirst({
    where: {
      notificationId: notif.id,
      userId: testUserId,
    },
  })

  if (!readTracking) {
    throw new Error('❌ NotificationRead tracking record was not created!')
  }
  console.log('✓ Verified NotificationRead tracking record created with IP:', readTracking.ipAddress)

  // 7. Test Mark as Unread
  console.log('Step 7: Testing mark as UNREAD...')
  await markNotificationUnread({
    id: notif.id,
    userId: testUserId,
    ipAddress: '127.0.0.1',
    browser: 'TestBrowser/1.0',
  })

  const unreadFetch = await getUserNotifications({ userId: testUserId })
  const unreadNotif = unreadFetch.notifications.find((n) => n.id === notif.id)
  if (!unreadNotif || unreadNotif.isRead !== false) {
    throw new Error('❌ markNotificationUnread failed to set isRead = false in DB!')
  }
  console.log('✓ Verified markNotificationUnread successfully set isRead = false.')

  // 8. Test Mark All as Read
  console.log('Step 8: Testing Mark All as Read...')
  await markAllNotificationsRead({
    userId: testUserId,
    ipAddress: '127.0.0.1',
    browser: 'TestBrowser/1.0',
  })

  const unreadCount = await getUnreadCount(testUserId)
  if (unreadCount !== 0) {
    throw new Error(`❌ markAllNotificationsRead left ${unreadCount} unread notifications!`)
  }
  console.log('✓ Verified Mark All as Read set DB unread count to 0.')

  // 9. Clean up test notification
  console.log('Step 9: Soft deleting test notification...')
  await deleteNotification({
    id: notif.id,
    userId: testUserId,
  })
  console.log('✓ Test notification soft deleted.')

  console.log('\n🎉 ALL PERSISTENCE TESTS PASSED CLEANLY!')
}

runNotificationPersistenceTests()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => db.$disconnect())

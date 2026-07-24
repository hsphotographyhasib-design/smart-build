'use client'

import React, { useCallback, useMemo } from 'react'
import {
  LogOut,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore, type AppPage } from '@/lib/store'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { useMenuData, IconByName, findActiveInfo } from '@/hooks/use-menu-data'

// ─────────────────────────────────────────────────────────────────────
// API মেনু ধরন, আইকন রেজোলিউশন, মেনু ডেটা হুক ও সক্রিয় সন্ধানকারী
// (@/hooks/use-menu-data থেকে আমদানিকৃত)
// ─────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────
// অ্যানিমেশন ভ্যারিয়্যান্টসমূহ
// ─────────────────────────────────────────────────────────────────────

const expandVariants = {
  hidden: { height: 0, opacity: 0, overflow: 'hidden' },
  visible: {
    height: 'auto', opacity: 1, overflow: 'hidden',
    transition: { height: { duration: 0.25, ease: [0.4, 0, 0.2, 1] as const }, opacity: { duration: 0.2, delay: 0.05, ease: 'easeOut' } },
  },
  exit: {
    height: 0, opacity: 0, overflow: 'hidden',
    transition: { height: { duration: 0.25, ease: [0.4, 0, 1, 1] as const }, opacity: { duration: 0.15, ease: 'easeIn' } },
  },
} satisfies Variants

// ─────────────────────────────────────────────────────────────────────
// মোবাইল স্কেলিটন
// ─────────────────────────────────────────────────────────────────────

function DrawerSkeleton() {
  return (
    <div className="space-y-2 px-2 py-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <Skeleton className="h-11 w-full rounded-lg" />
          {i < 3 && (
            <div className="pl-4 space-y-1">
              <Skeleton className="h-10 w-[80%] rounded-lg" />
              {i < 2 && <Skeleton className="h-10 w-[65%] rounded-lg" />}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// মোবাইল আরও ড্রয়ার
// ─────────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  if (!name) return 'U'
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

export function MobileMoreDrawer() {
  const { user, currentPage, navigate, logout, showMobileMoreDrawer, setShowMobileMoreDrawer, expandedMenuId, setExpandedMenuId, expandedSubItemId, setExpandedSubItemId } = useAppStore()
  const userRole = user?.role || 'admin'
  const { menuGroups, loading } = useMenuData(userRole)

  const activeInfo = useMemo(() => findActiveInfo(menuGroups, currentPage), [menuGroups, currentPage])

  // Effective expanded: if user explicitly selected a menu, use that exclusively.
  // If no manual selection, auto-expand based on active route.
  const effectiveExpandedMenuId = expandedMenuId || activeInfo.groupId || ''
  const effectiveExpandedSubItemId = expandedSubItemId || activeInfo.itemId || ''

  // Accordion toggle: opening a new group auto-closes the previous
  const toggleGroup = useCallback((groupId: string) => {
    if (expandedMenuId === groupId) {
      setExpandedMenuId('')
    } else {
      setExpandedMenuId(groupId)
    }
    setExpandedSubItemId('')
  }, [expandedMenuId, setExpandedMenuId, setExpandedSubItemId])

  // Sub-item accordion toggle within a group
  const toggleItem = useCallback((itemId: string) => {
    if (expandedSubItemId === itemId) {
      setExpandedSubItemId('')
    } else {
      setExpandedSubItemId(itemId)
    }
  }, [expandedSubItemId, setExpandedSubItemId])

  const handleNav = useCallback((page: string) => {
    navigate(page as AppPage)
    setShowMobileMoreDrawer(false)
  }, [navigate, setShowMobileMoreDrawer])

  const roleName = (user?.role || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <Sheet open={showMobileMoreDrawer} onOpenChange={setShowMobileMoreDrawer}>
      <SheetContent side="right" className="w-full sm:max-w-sm p-0">
        <SheetHeader className="px-4 pt-4 pb-2">
          <SheetTitle className="text-lg">More</SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">All modules</SheetDescription>
        </SheetHeader>

        {/* ব্যবহারকারী প্রোফাইল কার্ড */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 rounded-xl bg-amber-50 p-3 dark:bg-amber-950/30">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarFallback className="text-sm font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200">
                {getInitials(user?.name || '')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-amber-700 dark:text-amber-300 capitalize truncate">{roleName}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* ৩-স্তর স্তরবিন্যাস্ত নেভিগেশন */}
        <ScrollArea className="flex-1 py-2 px-2" style={{ maxHeight: 'calc(100vh - 240px)' }}>
          {loading ? (
            <DrawerSkeleton />
          ) : (
            <div className="space-y-0.5">
              {menuGroups.map((group) => {
                // Enforce MAX DEPTH 2: flatten any legacy 3rd-level categories
                const leafItems = group.items.flatMap((item) =>
                  item.hasChildren ? item.children : item.isCategory ? [] : [item]
                )
                const isSingleItem = leafItems.length === 1
                const hasActiveChild = leafItems.some((item) => item.page === currentPage)
                const isGroupExpanded = effectiveExpandedMenuId === group.id

                return (
                  <div key={group.id}>
                    <button
                      onClick={() => {
                        if (isSingleItem) handleNav(leafItems[0].page)
                        else toggleGroup(group.id)
                      }}
                      className={cn(
                        'flex items-center gap-2.5 w-full h-11 px-3 rounded-lg text-sm font-semibold transition-colors',
                        'hover:bg-accent/50 active:bg-accent/80',
                        hasActiveChild
                          ? 'text-amber-900 bg-amber-50/80 dark:text-amber-200 dark:bg-amber-950/20'
                          : 'text-foreground'
                      )}
                    >
                      <IconByName name={group.icon} className={cn('h-5 w-5 shrink-0', hasActiveChild ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground')} />
                      <span className="flex-1 text-left truncate">{group.label}</span>
                      {!isSingleItem && (
                        <motion.div animate={{ rotate: isGroupExpanded ? 0 : -90 }} transition={{ duration: 0.2, ease: 'easeInOut' }}>
                          <ChevronDown className={cn('h-4 w-4 shrink-0', hasActiveChild ? 'text-amber-600' : 'text-muted-foreground')} />
                        </motion.div>
                      )}
                    </button>

                    {isSingleItem ? null : (
                      <AnimatePresence initial={false}>
                        {isGroupExpanded && (
                          <motion.div key={`${group.id}-children`} variants={expandVariants} initial="hidden" animate="visible" exit="exit">
                            <div className="pl-4 pr-1 py-1 space-y-0.5">
                              {/* Strict 2-level: every entry is a direct, navigable sub-menu */}
                              {leafItems.map((item) => {
                                const isItemActive = item.page === currentPage
                                return (
                                  <button
                                    key={item.id}
                                    onClick={() => handleNav(item.page)}
                                    className={cn(
                                      'flex items-center gap-2.5 w-full h-11 px-3 rounded-lg text-[13px] transition-colors',
                                      'hover:bg-accent/50 active:bg-accent/80',
                                      isItemActive
                                        ? 'font-medium bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
                                        : 'text-muted-foreground'
                                    )}
                                  >
                                    <IconByName name={item.icon} className={cn('h-4 w-4 shrink-0', isItemActive && 'text-amber-600 dark:text-amber-400')} />
                                    <span className="truncate">{item.label}</span>
                                  </button>
                                )
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>

        <Separator />

        <div className="p-3">
          <Button
            variant="ghost"
            className="w-full h-11 justify-start gap-3 px-3 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
            onClick={() => { setShowMobileMoreDrawer(false); logout() }}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Log Out</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
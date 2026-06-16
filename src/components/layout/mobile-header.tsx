'use client'

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import {
  Menu,
  Bell,
  HardHat,
  ChevronDown,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore, type AppPage } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { AnimatePresence, motion } from 'framer-motion'
import { SessionTimerBadge } from '@/components/layout/session-timer-badge'
import { useMenuData, IconByName, findActiveInfo } from '@/hooks/use-menu-data'
import { SearchTrigger } from '@/components/search/search-trigger'
import { GlobalSearchDialog } from '@/components/search/global-search'

// ─────────────────────────────────────────────────────────────────────
// অ্যানিমেশন
// ─────────────────────────────────────────────────────────────────────

const expandVariants = {
  hidden: { height: 0, opacity: 0, overflow: 'hidden' },
  visible: {
    height: 'auto', opacity: 1, overflow: 'hidden',
    transition: { height: { duration: 0.25, ease: [0.4, 0, 0.2, 1] }, opacity: { duration: 0.2, delay: 0.05, ease: 'easeOut' } },
  },
  exit: {
    height: 0, opacity: 0, overflow: 'hidden',
    transition: { height: { duration: 0.2, ease: [0.4, 0, 1, 1] }, opacity: { duration: 0.15, ease: 'easeIn' } },
  },
}

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
// সহায়ক ফাংশনসমূহ
// ─────────────────────────────────────────────────────────────────────

function getRoleColor(role: string) {
  const colors: Record<string, string> = {
    admin: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200',
    supervisor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200',
    project_manager: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200',
    site_engineer: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200',
    qs: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200',
    accountant: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200',
    hr_manager: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200',
    store_manager: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-200',
    client: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-200',
    labour: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-200',
    technician: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200',
    dispatcher: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-200',
  }
  return colors[role] || 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-200'
}

function getInitials(name: string) {
  if (!name) return 'U'
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

// ─────────────────────────────────────────────────────────────────────
// স্তরবিন্যাস্ত ড্রয়ার সহ মোবাইল হেডার
// ─────────────────────────────────────────────────────────────────────

export function MobileHeader() {
  const { user, logout, navigate, currentPage, expandedMenuId, setExpandedMenuId, expandedSubItemId, setExpandedSubItemId } = useAppStore()
  const [sheetOpen, setSheetOpen] = useState(false)

  const initials = getInitials(user?.name || '')
  const roleColor = getRoleColor(user?.role || '')
  const roleName = (user?.role || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  const userRole = user?.role || 'labour'
  const { menuGroups, loading } = useMenuData(userRole)

  const activeInfo = useMemo(() => findActiveInfo(menuGroups, currentPage), [menuGroups, currentPage])

  // Effective expanded: global store takes priority, then active route
  const effectiveExpandedMenuId = expandedMenuId || activeInfo.groupId || ''
  const effectiveExpandedItemId = expandedSubItemId || activeInfo.itemId || ''

  // মোবাইল ড্রয়ার খোলা থাকলে বডি স্ক্রল লক করা হচ্ছে
  useEffect(() => {
    if (sheetOpen) {
      document.body.classList.add('sb-body-lock')
    } else {
      document.body.classList.remove('sb-body-lock')
    }
    return () => document.body.classList.remove('sb-body-lock')
  }, [sheetOpen])

  // Accordion toggle: only one group open at a time
  const toggleGroup = useCallback((groupId: string) => {
    if (expandedMenuId === groupId) {
      setExpandedMenuId('')
    } else {
      setExpandedMenuId(groupId)
    }
    setExpandedSubItemId('')
  }, [expandedMenuId, setExpandedMenuId, setExpandedSubItemId])

  // Sub-item accordion within a group
  const toggleItem = useCallback((itemId: string) => {
    if (expandedSubItemId === itemId) {
      setExpandedSubItemId('')
    } else {
      setExpandedSubItemId(itemId)
    }
  }, [expandedSubItemId, setExpandedSubItemId])

  const handleNav = useCallback((page: string) => {
    navigate(page as AppPage)
    setSheetOpen(false)
  }, [navigate])

  const handleLogout = () => {
    logout()
    setSheetOpen(false)
  }

  return (
    <>
      <GlobalSearchDialog />
      {/* মোবাইল হেডার বার */}
      <header className="md:hidden sticky top-0 z-50 h-14 bg-card border-b flex items-center justify-between px-3">
        <Button variant="ghost" size="icon" className="h-11 w-11 -ml-1" onClick={() => setSheetOpen(true)} aria-label="Open navigation menu">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-amber-600 flex items-center justify-center shrink-0">
            <HardHat className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-xs tracking-wider text-foreground">SMARTBUILD</span>
        </div>
        <div className="flex items-center gap-1">
          <SearchTrigger />
          <SessionTimerBadge />
          <Button variant="ghost" size="icon" className="h-11 w-11 relative -mr-1" onClick={() => navigate('notifications')} aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-11 w-11 -ml-1" aria-label="Profile">
            <Avatar className="h-7 w-7">
              <AvatarFallback className={cn('text-[10px] font-bold', roleColor)}>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </div>
      </header>

      {/* স্তরবিন্যাস্ত নেভ সহ মোবাইল শিট ড্রয়ার */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="w-[300px] sm:w-[340px] p-0">
          {/* হেডার */}
          <SheetHeader className="px-4 pt-4 pb-2">
            <SheetTitle className="text-lg">Navigation</SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">Browse all modules</SheetDescription>
          </SheetHeader>

          {/* ব্যবহারকারী প্রোফাইল কার্ড */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-3 rounded-xl bg-amber-50 p-3 dark:bg-amber-950/30">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarFallback className="text-sm font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-amber-700 dark:text-amber-300 capitalize truncate">{roleName}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* স্তরবিন্যাস্ত নেভিগেশন */}
          <ScrollArea className="flex-1 overflow-y-auto py-2 px-2 sb-custom-scrollbar" style={{ maxHeight: 'calc(100vh - 240px)' }}>
            {loading ? (
              <DrawerSkeleton />
            ) : (
              <div className="space-y-0.5">
                {menuGroups.map((group) => {
                  const isSingleItem = group.items.length === 1 && !group.items[0].hasChildren && !group.items[0].isCategory
                  const hasActiveChild = group.items.some((item) => {
                    if (item.page === currentPage && !item.isCategory) return true
                    if (item.hasChildren && item.children.some((c) => c.page === currentPage)) return true
                    return false
                  })
                  const isGroupExpanded = effectiveExpandedMenuId === group.id

                  return (
                    <div key={group.id}>
                      {/* প্যারেন্ট বাটন */}
                      <button
                        onClick={() => {
                          if (isSingleItem) handleNav(group.items[0].page)
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
                        <IconByName name={group.icon} className={cn(
                          'h-5 w-5 shrink-0',
                          hasActiveChild ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'
                        )} />
                        <span className="flex-1 text-left truncate">{group.label}</span>
                        {!isSingleItem && (
                          <motion.div
                            animate={{ rotate: isGroupExpanded ? 0 : -90 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                          >
                            <ChevronDown className={cn('h-4 w-4 text-muted-foreground shrink-0', hasActiveChild && 'text-amber-600')} />
                          </motion.div>
                        )}
                      </button>

                      {/* চাইল্ড্রেন */}
                      {isSingleItem ? null : (
                        <AnimatePresence initial={false}>
                          {isGroupExpanded && (
                            <motion.div
                              key={`${group.id}-children`}
                              variants={expandVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                            >
                              <div className="pl-4 pr-1 py-1 space-y-0.5">
                                {group.items.map((item) => {
                                  const isItemFolder = item.isCategory || item.hasChildren
                                  const isItemActive = item.page === currentPage && !item.isCategory
                                  const hasActiveDesc = item.hasChildren && item.children.some((c) => c.page === currentPage)
                                  const isItemExpanded = effectiveExpandedItemId === item.id

                                  // পাতা আইটেম
                                  if (!isItemFolder) {
                                    return (
                                      <button
                                        key={item.id}
                                        onClick={() => handleNav(item.page)}
                                        className={cn(
                                          'flex items-center gap-2.5 w-full h-10 px-3 rounded-lg text-[13px] transition-colors',
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
                                  }

                                  // ফোল্ডার আইটেম — প্রসারণযোগ্য
                                  return (
                                    <div key={item.id}>
                                      <button
                                        onClick={() => toggleItem(item.id)}
                                        className={cn(
                                          'flex items-center gap-2.5 w-full h-11 px-3 rounded-lg text-[13px] transition-colors',
                                          'hover:bg-accent/50 active:bg-accent/80',
                                          hasActiveDesc
                                            ? 'text-amber-900 dark:text-amber-200'
                                            : 'text-muted-foreground'
                                        )}
                                      >
                                        <IconByName name={item.icon} className={cn('h-4 w-4 shrink-0', hasActiveDesc ? 'text-amber-600 dark:text-amber-400' : '')} />
                                        <span className="flex-1 text-left truncate">{item.label}</span>
                                        <motion.div animate={{ rotate: isItemExpanded ? 0 : -90 }} transition={{ duration: 0.2, ease: 'easeInOut' }}>
                                          <ChevronDown className={cn('h-3.5 w-3.5 shrink-0', hasActiveDesc ? 'text-amber-600' : 'text-muted-foreground')} />
                                        </motion.div>
                                      </button>

                                      <AnimatePresence initial={false}>
                                        {isItemExpanded && (
                                          <motion.div key={`${item.id}-sub`} variants={expandVariants} initial="hidden" animate="visible" exit="exit">
                                            <div className="pl-6 pr-1 py-0.5 space-y-0.5">
                                              {item.children.map((child) => {
                                                const isChildActive = child.page === currentPage
                                                return (
                                                  <button
                                                    key={child.id}
                                                    onClick={() => handleNav(child.page)}
                                                    className={cn(
                                                      'flex items-center gap-2.5 w-full h-11 px-3 rounded-lg text-[12px] transition-colors',
                                                      'hover:bg-accent/50 active:bg-accent/80',
                                                      isChildActive
                                                        ? 'font-medium bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
                                                        : 'text-muted-foreground'
                                                    )}
                                                  >
                                                    <IconByName name={child.icon} className={cn('h-3.5 w-3.5 shrink-0', isChildActive && 'text-amber-600 dark:text-amber-400')} />
                                                    <span className="truncate">{child.label}</span>
                                                  </button>
                                                )
                                              })}
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
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

          {/* লগআউট */}
          <div className="p-3">
            <Button
              variant="ghost"
              className="w-full h-11 justify-start gap-3 px-3 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Log Out</span>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// ─── Types ───
export interface ConversationItem {
  id: string
  lastMessageText?: string | null
  lastMessageAt?: string | null
  lastMessageDir: string
  status: string
  priority: string
  unreadCount: number
  assignedToId?: string | null
  assignedTo?: { id: string; name: string; avatarUrl?: string | null } | null
  contact: {
    id: string
    name?: string | null
    pushName?: string | null
    phone: string
    profilePicUrl?: string | null
  }
  ticketId?: string | null
  isBotConversation: boolean
}

interface WhatsAppConversationItemProps {
  conversation: ConversationItem
  isActive: boolean
  onClick: (id: string) => void
}

function getInitials(name?: string | null, phone?: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return name.substring(0, 2).toUpperCase()
  }
  if (phone) return phone.slice(-4)
  return '??'
}

function formatRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d`
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'emergency': return 'bg-red-500'
    case 'high': return 'bg-orange-500'
    case 'medium': return 'bg-amber-400'
    case 'low': return 'bg-emerald-500'
    default: return 'bg-gray-300'
  }
}

function getPriorityLabel(priority: string): string {
  switch (priority) {
    case 'emergency': return 'Emergency'
    case 'high': return 'High'
    case 'medium': return 'Medium'
    case 'low': return 'Low'
    default: return priority
  }
}

function truncate(str: string, len: number): string {
  if (str.length <= len) return str
  return str.substring(0, len) + '…'
}

export function WhatsAppConversationItem({ conversation, isActive, onClick }: WhatsAppConversationItemProps) {
  const displayName = conversation.contact.name || conversation.contact.pushName || conversation.contact.phone
  const initials = getInitials(conversation.contact.name || conversation.contact.pushName, conversation.contact.phone)
  const isOutgoing = conversation.lastMessageDir === 'outgoing'

  return (
    <TooltipProvider delayDuration={300}>
      <div
        onClick={() => onClick(conversation.id)}
        className={cn(
          'flex items-center gap-3 px-3 py-3 cursor-pointer border-b border-gray-50 dark:border-gray-800/50 transition-colors relative',
          isActive
            ? 'bg-amber-50 dark:bg-amber-900/20 border-l-2 border-l-amber-500'
            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border-l-2 border-l-transparent'
        )}
      >
        {/* অনলাইন সূচকসহ অ্যাভাটার */}
        <div className="relative flex-shrink-0">
          <Avatar className="h-11 w-11">
            {conversation.contact.profilePicUrl ? (
              <img src={conversation.contact.profilePicUrl} alt={displayName} className="object-cover w-full h-full rounded-full" />
            ) : null}
            <AvatarFallback className={cn(
              'text-xs font-medium',
              isActive ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
            )}>
              {initials}
            </AvatarFallback>
          </Avatar>
          {conversation.status === 'open' && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full" />
          )}
        </div>

        {/* বিষয়বস্তু */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={cn(
                'text-sm font-semibold truncate',
                conversation.unreadCount > 0 ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'
              )}>
                {displayName}
              </span>
              {conversation.isBotConversation && (
                <Tooltip>
                  <TooltipTrigger>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 font-medium">BOT</span>
                  </TooltipTrigger>
                  <TooltipContent>Bot conversation</TooltipContent>
                </Tooltip>
              )}
            </div>
            <span className={cn(
              'text-[11px] flex-shrink-0',
              conversation.unreadCount > 0 ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-gray-400'
            )}>
              {formatRelativeTime(conversation.lastMessageAt)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 mt-0.5">
            <p className={cn(
              'text-xs truncate flex items-center gap-1',
              conversation.unreadCount > 0 ? 'text-gray-800 dark:text-gray-200 font-medium' : 'text-gray-500 dark:text-gray-400'
            )}>
              {isOutgoing && <span className="text-gray-400">You:</span>}
              {truncate(conversation.lastMessageText || '', 35)}
            </p>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* অগ্রাধিকার বিন্দু */}
              {conversation.priority !== 'medium' && (
                <Tooltip>
                  <TooltipTrigger>
                    <span className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', getPriorityColor(conversation.priority))} />
                  </TooltipTrigger>
                  <TooltipContent>{getPriorityLabel(conversation.priority)}</TooltipContent>
                </Tooltip>
              )}
              {/* সংযুক্ত টিকেট সূচক */}
              {conversation.ticketId && (
                <Tooltip>
                  <TooltipTrigger>
                    <span className="w-2.5 h-2.5 rounded-full bg-violet-500 flex-shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent>Linked to ticket</TooltipContent>
                </Tooltip>
              )}
              {/* অপঠিত গণনা */}
              {conversation.unreadCount > 0 && (
                <span className="flex-shrink-0 min-w-[18px] h-[18px] rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                  {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                </span>
              )}
            </div>
          </div>

          {/* বরাদ্দকৃত এজেন্ট চিপ */}
          {conversation.assignedTo && (
            <div className="mt-1">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100">
                {conversation.assignedTo.name.split(' ')[0]}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Check, CheckCheck, Star, FileText, MapPin, Image as ImageIcon, Video, Music, User } from 'lucide-react'

// ─── Types ───
export interface WhatsAppMessage {
  id: string
  conversationId: string
  waMessageId?: string | null
  direction: 'incoming' | 'outgoing'
  messageType: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact' | 'sticker' | 'interactive' | 'template' | 'system'
  content?: string | null
  mediaUrl?: string | null
  mediaType?: string | null
  mediaFileSize?: number | null
  thumbnailUrl?: string | null
  location?: string | null
  contactInfo?: string | null
  templateName?: string | null
  templateParams?: string | null
  isRead: boolean
  isDelivered: boolean
  isStarred: boolean
  isDeleted: boolean
  senderType: 'customer' | 'agent' | 'bot' | 'system'
  senderId?: string | null
  repliedToId?: string | null
  repliedTo?: WhatsAppMessage | null
  createdAt: string
  contactSender?: { id: string; name?: string | null; phone: string; pushName?: string | null; profilePicUrl?: string | null } | null
  sentBy?: { id: string; name: string; avatarUrl?: string | null } | null
}

interface WhatsAppMessageBubbleProps {
  message: WhatsAppMessage
  onReply?: (message: WhatsAppMessage) => void
  onStar?: (messageId: string) => void
  onImageClick?: (url: string) => void
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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

export function WhatsAppMessageBubble({ message, onReply, onStar, onImageClick }: WhatsAppMessageBubbleProps) {
  const isOutgoing = message.direction === 'outgoing'
  const isSystem = message.senderType === 'system' || message.messageType === 'system'
  const isDeleted = message.isDeleted

  if (isDeleted) {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-gray-400 italic bg-gray-50 dark:bg-gray-800/50 px-3 py-1 rounded-lg">
          {isOutgoing ? 'You deleted this message' : 'This message was deleted'}
        </span>
      </div>
    )
  }

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full max-w-md text-center">
          {message.content}
        </span>
      </div>
    )
  }

  const replyToMessage = message.repliedTo

  return (
    <div
      className={cn('flex mb-1 group', isOutgoing ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'relative max-w-[75%] sm:max-w-[65%] rounded-2xl px-3 py-2 shadow-sm',
          isOutgoing
            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-gray-900 dark:text-gray-100 rounded-br-md'
            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md border border-gray-100 dark:border-gray-700'
        )}
      >
        {/* Sender name for agent messages */}
        {!isOutgoing && message.senderType === 'agent' && message.sentBy && (
          <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 mb-0.5">
            {message.sentBy.name} (Agent)
          </p>
        )}
        {!isOutgoing && message.senderType === 'bot' && (
          <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-0.5">
            SmartBuild Bot
          </p>
        )}

        {/* Reply context */}
        {replyToMessage && (
          <div className={cn(
            'mb-1.5 px-2.5 py-1.5 rounded-lg border-l-2 text-xs cursor-pointer',
            isOutgoing
              ? 'bg-emerald-200/50 dark:bg-emerald-800/30 border-emerald-500'
              : 'bg-gray-100 dark:bg-gray-700 border-gray-400 dark:border-gray-500'
          )}
            onClick={() => onReply?.(replyToMessage)}
          >
            <p className="font-semibold text-gray-700 dark:text-gray-300 truncate">
              {replyToMessage.direction === 'outgoing' ? 'You' : replyToMessage.contactSender?.name || replyToMessage.contactSender?.phone || 'Contact'}
            </p>
            <p className="text-gray-500 dark:text-gray-400 truncate">
              {replyToMessage.content || `[${replyToMessage.messageType}]`}
            </p>
          </div>
        )}

        {/* Message content */}
        {renderMessageContent(message, onImageClick)}

        {/* Footer: time, status, star */}
        <div className="flex items-center justify-end gap-1 mt-0.5 -mb-0.5">
          <span className="text-[10px] text-gray-500 dark:text-gray-400">
            {formatTime(message.createdAt)}
          </span>
          {isOutgoing && (
            <>
              {message.isRead ? (
                <CheckCheck className="h-3.5 w-3.5 text-emerald-600" />
              ) : message.isDelivered ? (
                <CheckCheck className="h-3.5 w-3.5 text-gray-400" />
              ) : (
                <Check className="h-3.5 w-3.5 text-gray-400" />
              )}
            </>
          )}
          {message.isStarred && (
            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
          )}
        </div>

        {/* Hover actions */}
        <div className={cn(
          'absolute top-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5',
          isOutgoing ? 'left-0 -translate-x-full mr-1.5' : 'right-0 translate-x-full ml-1.5'
        )}>
          <button
            onClick={() => onReply?.(message)}
            className="p-1 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm"
            title="Reply"
          >
            <svg className="h-3 w-3 text-gray-600 dark:text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 17-5-5 5-5"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
          </button>
          <button
            onClick={() => onStar?.(message.id)}
            className="p-1 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm"
            title={message.isStarred ? 'Unstar' : 'Star'}
          >
            <Star className={cn('h-3 w-3', message.isStarred ? 'text-amber-500 fill-amber-500' : 'text-gray-600 dark:text-gray-300')} />
          </button>
        </div>
      </div>
    </div>
  )
}

function renderMessageContent(message: WhatsAppMessage, onImageClick?: (url: string) => void): React.ReactNode {
  switch (message.messageType) {
    case 'text':
      return (
        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
          {message.content}
        </p>
      )

    case 'image':
      return (
        <div className="space-y-1.5">
          {message.thumbnailUrl || message.mediaUrl ? (
            <img
              src={message.thumbnailUrl || message.mediaUrl || ''}
              alt={message.content || 'Image'}
              className="rounded-lg max-h-64 w-auto cursor-pointer object-cover"
              onClick={() => onImageClick?.(message.mediaUrl || message.thumbnailUrl || '')}
            />
          ) : (
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-gray-400" />
            </div>
          )}
          {message.content && (
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          )}
        </div>
      )

    case 'video':
      return (
        <div className="space-y-1.5">
          <div className="relative bg-black rounded-lg overflow-hidden flex items-center justify-center min-h-[160px]">
            {message.thumbnailUrl ? (
              <img src={message.thumbnailUrl} alt="Video thumbnail" className="w-full h-full object-cover opacity-80" />
            ) : (
              <Video className="h-10 w-10 text-gray-500" />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/90 dark:bg-gray-800/90 flex items-center justify-center shadow-lg">
                <svg className="h-5 w-5 text-gray-800 dark:text-gray-200 ml-0.5" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </div>
            </div>
          </div>
          {message.content && (
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          )}
        </div>
      )

    case 'audio':
      return (
        <div className="flex items-center gap-3 py-1 min-w-[200px]">
          <button className="flex-shrink-0 w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center transition-colors">
            <svg className="h-4 w-4 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </button>
          <div className="flex-1 space-y-1">
            <div className="h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
              <div className="h-full w-0 bg-emerald-500 rounded-full" />
            </div>
            {message.mediaFileSize && (
              <p className="text-[10px] text-gray-500">{formatFileSize(message.mediaFileSize)}</p>
            )}
          </div>
        </div>
      )

    case 'document':
      return (
        <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg min-w-[200px]">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
            <FileText className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{message.content || 'Document'}</p>
            {message.mediaFileSize && (
              <p className="text-xs text-gray-500">{formatFileSize(message.mediaFileSize)}</p>
            )}
          </div>
          {message.mediaUrl && (
            <a href={message.mediaUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
              Download
            </a>
          )}
        </div>
      )

    case 'location':
      try {
        const loc = message.location ? JSON.parse(message.location) : null
        return (
          <div className="space-y-1.5">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-red-500 flex-shrink-0" />
              <div className="min-w-0">
                {loc?.name && <p className="text-sm font-medium truncate">{loc.name}</p>}
                {loc?.address && <p className="text-xs text-gray-500 truncate">{loc.address}</p>}
                {!loc?.name && !loc?.address && <p className="text-xs text-gray-500">Shared location</p>}
              </div>
            </div>
            {loc?.lat && loc?.lng && (
              <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 h-32 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <a
                  href={`https://www.google.com/maps?q=${loc.lat},${loc.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <MapPin className="h-3 w-3" />
                  Open in Maps
                </a>
              </div>
            )}
          </div>
        )
      } catch {
        return <p className="text-sm text-gray-500">Location shared</p>
      }

    case 'contact':
      try {
        const contactData = message.contactInfo ? JSON.parse(message.contactInfo) : null
        return (
          <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg min-w-[200px]">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarFallback className="bg-gray-200 dark:bg-gray-600 text-sm">
                {getInitials(contactData?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{contactData?.name || 'Contact'}</p>
              {contactData?.phone && (
                <p className="text-xs text-gray-500">{contactData.phone}</p>
              )}
            </div>
          </div>
        )
      } catch {
        return <p className="text-sm text-gray-500">Contact shared</p>
      }

    case 'template':
      return (
        <div className="space-y-1">
          {message.templateName && (
            <p className="text-[10px] text-gray-400 italic">Template: {message.templateName}</p>
          )}
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      )

    case 'sticker':
      return (
        <div className="p-2">
          {message.mediaUrl ? (
            <img src={message.mediaUrl} alt="Sticker" className="h-32 w-32 object-contain" />
          ) : (
            <div className="h-32 w-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎨</span>
            </div>
          )}
        </div>
      )

    case 'interactive':
      return (
        <div className="space-y-1.5">
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          <div className="space-y-1">
            {renderInteractiveButtons(message)}
          </div>
        </div>
      )

    default:
      return (
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
      )
  }
}

function renderInteractiveButtons(message: WhatsAppMessage) {
  try {
    const data = message.templateParams ? JSON.parse(message.templateParams) : null
    if (!data?.buttons) return null
    return data.buttons.map((btn: any, i: number) => (
      <div
        key={i}
        className="text-center py-2 px-3 rounded-lg bg-emerald-200/50 dark:bg-emerald-800/30 text-sm text-emerald-800 dark:text-emerald-200 font-medium border border-emerald-300/50 dark:border-emerald-700/50"
      >
        {btn.text || btn.title || btn.label}
      </div>
    ))
  } catch {
    return null
  }
}

// ─── Typing Indicator ───
export function TypingIndicator({ name }: { name?: string }) {
  return (
    <div className="flex justify-start mb-1">
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          {name && <span className="text-[10px] text-gray-500 mr-1">{name}</span>}
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Date Separator ───
export function DateSeparator({ date }: { date: string }) {
  const d = new Date(date)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = d.toDateString() === yesterday.toDateString()

  let label: string
  if (isToday) label = 'Today'
  else if (isYesterday) label = 'Yesterday'
  else label = d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })

  return (
    <div className="flex justify-center my-3">
      <span className="text-[11px] text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
        {label}
      </span>
    </div>
  )
}
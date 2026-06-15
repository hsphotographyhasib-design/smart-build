'use client'

import React from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Phone, ExternalLink, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ContactData {
  id: string
  name?: string | null
  pushName?: string | null
  phone: string
  profilePicUrl?: string | null
  status?: string
  customerId?: string | null
  customer?: {
    id: string
    name: string
  } | null
  tags?: string | null
  notes?: string | null
  lastSeenAt?: string | null
}

interface WhatsAppContactInfoProps {
  contact: ContactData
  onNavigateToCustomer?: (customerId: string) => void
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

function getStatusColor(status?: string): string {
  switch (status) {
    case 'active': return 'bg-emerald-500'
    case 'blocked': return 'bg-red-500'
    case 'opted_out': return 'bg-gray-400'
    default: return 'bg-gray-300'
  }
}

function getStatusLabel(status?: string): string {
  switch (status) {
    case 'active': return 'Active'
    case 'blocked': return 'Blocked'
    case 'opted_out': return 'Opted Out'
    default: return status || 'Unknown'
  }
}

export function WhatsAppContactInfo({ contact, onNavigateToCustomer }: WhatsAppContactInfoProps) {
  const displayName = contact.name || contact.pushName || contact.phone
  const initials = getInitials(contact.name || contact.pushName, contact.phone)
  let parsedTags: string[] = []
  try {
    if (contact.tags) parsedTags = JSON.parse(contact.tags)
  } catch { /* ignore */ }

  return (
    <div className="space-y-4">
      {/* Profile card */}
      <div className="flex flex-col items-center text-center py-4">
        <Avatar className="h-20 w-20 mb-3 ring-2 ring-gray-100 dark:ring-gray-700">
          {contact.profilePicUrl ? (
            <img src={contact.profilePicUrl} alt={displayName} className="object-cover w-full h-full rounded-full" />
          ) : null}
          <AvatarFallback className="text-lg font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            {initials}
          </AvatarFallback>
        </Avatar>
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{displayName}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
          <Phone className="h-3 w-3" />
          {contact.phone}
        </p>
        <Badge
          variant="secondary"
          className="mt-2 text-[10px] px-2 py-0.5"
        >
          <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5 inline-block', getStatusColor(contact.status))} />
          {getStatusLabel(contact.status)}
        </Badge>
      </div>

      <Separator />

      {/* Linked customer */}
      {contact.customerId && contact.customer && (
        <div className="px-1">
          <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Linked Customer
          </p>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 text-sm h-9"
            onClick={() => onNavigateToCustomer?.(contact.customerId!)}
          >
            <div className="h-6 w-6 rounded bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                {getInitials(contact.customer.name)}
              </span>
            </div>
            <span className="truncate">{contact.customer.name}</span>
            <ExternalLink className="h-3 w-3 text-gray-400 ml-auto flex-shrink-0" />
          </Button>
        </div>
      )}

      {/* Tags */}
      {parsedTags.length > 0 && (
        <div className="px-1">
          <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Tag className="h-3 w-3" />
            Tags
          </p>
          <div className="flex flex-wrap gap-1.5">
            {parsedTags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-[11px] px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {contact.notes && (
        <div className="px-1">
          <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Notes
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5 whitespace-pre-wrap">
            {contact.notes}
          </p>
        </div>
      )}
    </div>
  )
}


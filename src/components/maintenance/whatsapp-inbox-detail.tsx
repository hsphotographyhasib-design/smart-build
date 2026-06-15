'use client'

import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/store'
import { cn } from '@/lib/utils'
import {
  ArrowRightLeft, Archive, ExternalLink, MessageSquarePlus,
  StickyNote, AlertTriangle, Clock, CheckCircle, XCircle,
  FileText, Wrench, FileSpreadsheet, Shield, ChevronDown, ChevronUp,
} from 'lucide-react'
import { WhatsAppContactInfo } from './whatsapp-contact-info'
import { WhatsAppConvertDialog } from './whatsapp-convert-dialog'
import { WhatsAppAssignDialog } from './whatsapp-assign-dialog'
import type { WhatsAppMessage } from './whatsapp-message-bubble'
import { useQuery } from '@tanstack/react-query'

// ─── Types ───
interface ConversationData {
  id: string
  status: string
  priority: string
  createdAt: string
  resolvedAt?: string | null
  assignedToId?: string | null
  assignedTo?: { id: string; name: string; avatarUrl?: string | null } | null
  ticketId?: string | null
  ticket?: { id: string; ticketNo: string; title?: string; status: string } | null
  internalNotes?: string | null
  tags?: string | null
}

interface ContactData {
  id: string
  name?: string | null
  pushName?: string | null
  phone: string
  profilePicUrl?: string | null
  status?: string
  customerId?: string | null
  customer?: { id: string; name: string } | null
  tags?: string | null
  notes?: string | null
  lastSeenAt?: string | null
}

interface InternalNote {
  note: string
  agentId: string
  agentName?: string
  createdAt: string
}

interface WhatsAppInboxDetailProps {
  conversation: ConversationData
  contact: ContactData
  messages: WhatsAppMessage[]
  onAssign: (conversationId: string, agentId: string) => void
  onConvert: (conversationId: string) => void
  onTransfer: (conversationId: string, agentId: string, note?: string) => void
  onClose: (conversationId: string) => void
  onRefresh: () => void
  onNavigateToTicket?: (ticketId: string) => void
  onNavigateToCustomer?: (customerId: string) => void
}

function getPriorityBadge(priority: string) {
  const config: Record<string, { label: string; className: string }> = {
    emergency: { label: 'Emergency', className: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    high: { label: 'High', className: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    medium: { label: 'Medium', className: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    low: { label: 'Low', className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  }
  const c = config[priority] || config.medium
  return <Badge variant="secondary" className={cn('text-[10px] px-2 py-0.5', c.className)}>{c.label}</Badge>
}

function getStatusBadge(status: string) {
  const config: Record<string, { label: string; icon: any; className: string }> = {
    open: { label: 'Open', icon: MessageSquarePlus, className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    closed: { label: 'Closed', icon: CheckCircle, className: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' },
    archived: { label: 'Archived', icon: Archive, className: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' },
    spam: { label: 'Spam', icon: XCircle, className: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
  }
  const c = config[status] || config.open
  const Icon = c.icon
  return (
    <Badge variant="secondary" className={cn('text-[10px] px-2 py-0.5 gap-1', c.className)}>
      <Icon className="h-3 w-3" />
      {c.label}
    </Badge>
  )
}

function parseInternalNotes(raw?: string | null): InternalNote[] {
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function WhatsAppInboxDetail({
  conversation,
  contact,
  messages,
  onAssign,
  onConvert,
  onTransfer,
  onClose,
  onRefresh,
  onNavigateToTicket,
  onNavigateToCustomer,
}: WhatsAppInboxDetailProps) {
  const [newNote, setNewNote] = useState('')
  const [notesExpanded, setNotesExpanded] = useState(true)
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [isUpdatingPriority, setIsUpdatingPriority] = useState(false)
  const [convertOpen, setConvertOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)
  const { toast } = useToast()

  const notes = parseInternalNotes(conversation.internalNotes)
  const displayName = contact.name || contact.pushName || contact.phone

  const handleAddNote = async () => {
    if (!newNote.trim()) return
    setIsAddingNote(true)
    try {
      const res = await api.post('/api/maintenance/whatsapp/notes', {
        conversationId: conversation.id,
        note: newNote.trim(),
      })
      if (res.success) {
        toast({ title: 'Note added' })
        setNewNote('')
        onRefresh()
      } else {
        toast({ title: res.error || 'Failed to add note', variant: 'destructive' })
      }
    } catch (err: any) {
      toast({ title: err.message || 'Error', variant: 'destructive' })
    } finally {
      setIsAddingNote(false)
    }
  }

  const handlePriorityChange = async (newPriority: string) => {
    setIsUpdatingPriority(true)
    try {
      const res = await api.put(`/api/maintenance/whatsapp/conversations/${conversation.id}`, { priority: newPriority })
      if (res.success) {
        toast({ title: 'Priority updated' })
        onRefresh()
      } else {
        toast({ title: res.error || 'Failed', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error updating priority', variant: 'destructive' })
    } finally {
      setIsUpdatingPriority(false)
    }
  }

  const handleCloseChat = async () => {
    try {
      const res = await api.put(`/api/maintenance/whatsapp/conversations/${conversation.id}`, { status: 'closed' })
      if (res.success) {
        toast({ title: 'Chat closed' })
        onRefresh()
      } else {
        toast({ title: res.error || 'Failed', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error closing chat', variant: 'destructive' })
    }
  }

  const lastMessages = messages.slice(-5).map(m => ({ content: m.content }))

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-5">
          {/* Contact info */}
          <WhatsAppContactInfo
            contact={contact}
            onNavigateToCustomer={onNavigateToCustomer}
          />

          <Separator />

          {/* Conversation details */}
          <div className="space-y-3">
            <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Conversation Details
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-gray-400 mb-1">Priority</p>
                <Select value={conversation.priority} onValueChange={handlePriorityChange} disabled={isUpdatingPriority}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 mb-1">Status</p>
                <div className="mt-0.5">{getStatusBadge(conversation.status)}</div>
              </div>
            </div>

            <div>
              <p className="text-[10px] text-gray-400 mb-1">Created</p>
              <p className="text-xs text-gray-700 dark:text-gray-300">{formatDate(conversation.createdAt)}</p>
            </div>
          </div>

          <Separator />

          {/* Assignment */}
          <div className="space-y-2">
            <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Assignment
            </p>
            {conversation.assignedTo ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                      {conversation.assignedTo.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{conversation.assignedTo.name}</p>
                    <p className="text-[10px] text-gray-400">Assigned</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <WhatsAppAssignDialog
                    conversationId={conversation.id}
                    currentAssigneeId={conversation.assignedToId}
                    currentAssigneeName={conversation.assignedTo.name}
                    trigger={<Button variant="ghost" size="icon" className="h-7 w-7"><ArrowRightLeft className="h-3 w-3" /></Button>}
                    onSuccess={onRefresh}
                    open={assignOpen}
                    onOpenChange={setAssignOpen}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Unassigned</span>
                <WhatsAppAssignDialog
                  conversationId={conversation.id}
                  trigger={<Button variant="outline" size="sm" className="h-7 text-[11px] gap-1"><ArrowRightLeft className="h-3 w-3" />Assign</Button>}
                  onSuccess={onRefresh}
                  open={assignOpen}
                  onOpenChange={setAssignOpen}
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Linked ticket */}
          <div className="space-y-2">
            <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Linked Ticket
            </p>
            {conversation.ticket || conversation.ticketId ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 text-xs h-9"
                onClick={() => onNavigateToTicket?.(conversation.ticketId || conversation.ticket?.id || '')}
              >
                <FileText className="h-3.5 w-3.5 text-amber-600" />
                <span className="font-medium">{conversation.ticket?.ticketNo || conversation.ticketId}</span>
                {conversation.ticket?.title && (
                  <span className="text-gray-500 truncate ml-1">{conversation.ticket.title}</span>
                )}
                <ExternalLink className="h-3 w-3 text-gray-400 ml-auto flex-shrink-0" />
              </Button>
            ) : (
              <p className="text-xs text-gray-400">No ticket linked</p>
            )}
          </div>

          <Separator />

          {/* Internal notes */}
          <div className="space-y-2">
            <button
              className="flex items-center justify-between w-full text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              onClick={() => setNotesExpanded(!notesExpanded)}
            >
              <span className="flex items-center gap-1">
                <StickyNote className="h-3 w-3" />
                Internal Notes ({notes.length})
              </span>
              {notesExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>

            {notesExpanded && (
              <div className="space-y-2">
                {notes.length > 0 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {notes.map((n, i) => (
                      <div key={i} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400">
                            {n.agentName || 'Agent'}
                          </span>
                          <span className="text-[10px] text-gray-400">{formatDate(n.createdAt)}</span>
                        </div>
                        <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{n.note}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-1.5">
                  <Textarea
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    placeholder="Add internal note…"
                    rows={2}
                    className="text-xs resize-none flex-1"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || isAddingNote}
                  className="w-full h-8 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  {isAddingNote ? 'Adding…' : 'Add Note'}
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Quick actions */}
          <div className="space-y-2">
            <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Quick Actions
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              <WhatsAppConvertDialog
                conversationId={conversation.id}
                contactPhone={contact.phone}
                contactName={displayName}
                lastMessages={lastMessages}
                customerId={contact.customerId}
                trigger={
                  <Button variant="outline" size="sm" className="w-full h-8 text-[11px] gap-1 justify-start">
                    <AlertTriangle className="h-3 w-3 text-orange-500" />
                    Ticket
                  </Button>
                }
                onSuccess={onRefresh}
                open={convertOpen}
                onOpenChange={setConvertOpen}
              />

              <WhatsAppConvertDialog
                conversationId={conversation.id}
                contactPhone={contact.phone}
                contactName={displayName}
                lastMessages={lastMessages}
                customerId={contact.customerId}
                convertType="work_order"
                trigger={
                  <Button variant="outline" size="sm" className="w-full h-8 text-[11px] gap-1 justify-start">
                    <Wrench className="h-3 w-3 text-amber-600" />
                    Work Order
                  </Button>
                }
                onSuccess={onRefresh}
              />

              <WhatsAppConvertDialog
                conversationId={conversation.id}
                contactPhone={contact.phone}
                contactName={displayName}
                lastMessages={lastMessages}
                customerId={contact.customerId}
                convertType="quotation"
                trigger={
                  <Button variant="outline" size="sm" className="w-full h-8 text-[11px] gap-1 justify-start">
                    <FileSpreadsheet className="h-3 w-3 text-emerald-600" />
                    Quotation
                  </Button>
                }
                onSuccess={onRefresh}
              />

              <WhatsAppConvertDialog
                conversationId={conversation.id}
                contactPhone={contact.phone}
                contactName={displayName}
                lastMessages={lastMessages}
                customerId={contact.customerId}
                convertType="amc"
                trigger={
                  <Button variant="outline" size="sm" className="w-full h-8 text-[11px] gap-1 justify-start">
                    <Shield className="h-3 w-3 text-violet-600" />
                    AMC
                  </Button>
                }
                onSuccess={onRefresh}
              />
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <WhatsAppAssignDialog
                conversationId={conversation.id}
                currentAssigneeId={conversation.assignedToId}
                currentAssigneeName={conversation.assignedTo?.name}
                isTransfer
                trigger={
                  <Button variant="outline" size="sm" className="w-full h-8 text-[11px] gap-1 justify-start">
                    <ArrowRightLeft className="h-3 w-3" />
                    Transfer
                  </Button>
                }
                onSuccess={onRefresh}
                open={transferOpen}
                onOpenChange={setTransferOpen}
              />

              {conversation.status === 'open' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-8 text-[11px] gap-1 justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={handleCloseChat}
                >
                  <Archive className="h-3 w-3" />
                  Close Chat
                </Button>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
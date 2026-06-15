'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, useAppStore } from '@/lib/store'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { useWhatsAppSocket } from '@/hooks/use-whatsapp-socket'
import { WhatsAppConversationItem, type ConversationItem } from './whatsapp-conversation-item'
import { WhatsAppMessageBubble, TypingIndicator, DateSeparator, type WhatsAppMessage } from './whatsapp-message-bubble'
import { WhatsAppMessageInput } from './whatsapp-message-input'
import { WhatsAppInboxDetail } from './whatsapp-inbox-detail'
import {
  Search, ArrowLeft, MoreVertical, CheckCheck, Star, Archive,
  Info, Filter, MessageSquare, Circle, Users, Link2, WifiOff, Wifi,
  PanelRightOpen, PanelRightClose, RefreshCw,
} from 'lucide-react'

// ─── প্রকারভেদ ───
interface ConversationWithContact extends ConversationItem {
  contact: NonNullable<ConversationItem['contact']>
}

type FilterTab = 'all' | 'unread' | 'open' | 'assigned' | 'mine' | 'has_ticket'

// ─── ট্যাব গণনা সহায়ক ───
interface TabCounts {
  all: number
  unread: number
  open: number
  assigned: number
  mine: number
  has_ticket: number
}

// ─── প্রধান উপাদান ───
export default function WhatsAppComplaint() {
  const { user, pageParams, navigate } = useAppStore()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // স্থানীয় অবস্থা
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    pageParams?.conversationId || null
  )
  const [replyingTo, setReplyingTo] = useState<WhatsAppMessage | null>(null)
  const [showRightPanel, setShowRightPanel] = useState(true)
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list')
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // ─── সকেট ───
  const {
    isConnected,
    joinConversation,
    leaveConversation,
    emitTyping,
  } = useWhatsAppSocket({
    onNewMessage: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['wa-conversations'] })
      if (data.conversationId === selectedConversationId) {
        queryClient.invalidateQueries({ queryKey: ['wa-messages', selectedConversationId] })
      }
    },
    onConversationUpdated: () => {
      queryClient.invalidateQueries({ queryKey: ['wa-conversations'] })
      if (selectedConversationId) {
        queryClient.invalidateQueries({ queryKey: ['wa-conversation', selectedConversationId] })
      }
    },
    onNotification: (data: any) => {
      toast({ title: data.title || 'New notification', description: data.body })
    },
  })

  // ─── কথোপকথন রুমে যোগদান/বাহির ───
  useEffect(() => {
    if (selectedConversationId && isConnected) {
      joinConversation(selectedConversationId)
    }
    return () => {
      if (selectedConversationId) {
        leaveConversation(selectedConversationId)
      }
    }
  }, [selectedConversationId, isConnected])

  // ─── কথোপকথন আনা ───
  const { data: conversations = [], isLoading: convLoading } = useQuery<ConversationWithContact[]>({
    queryKey: ['wa-conversations', activeFilter, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      params.set('filter', activeFilter)
      const res = await api.get<ConversationWithContact[]>(`/api/whatsapp/conversations?${params}`)
      return res.success ? (res.data || []) : []
    },
    refetchInterval: 15000,
  })

  // ─── নির্বাচিত কথোপকথনের বিবরণ আনা ───
  const { data: conversationDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['wa-conversation', selectedConversationId],
    queryFn: async () => {
      if (!selectedConversationId) return null
      const res = await api.get(`/api/whatsapp/conversations/${selectedConversationId}`)
      return res.success ? res.data : null
    },
    enabled: !!selectedConversationId,
  })

  // ─── বার্তা আনা ───
  const { data: messages = [], isLoading: msgsLoading } = useQuery<WhatsAppMessage[]>({
    queryKey: ['wa-messages', selectedConversationId],
    queryFn: async () => {
      if (!selectedConversationId) return []
      const res = await api.get<WhatsAppMessage[]>(`/api/whatsapp/conversations/${selectedConversationId}/messages`)
      return res.success ? (res.data || []) : []
    },
    enabled: !!selectedConversationId,
  })

  // ─── বার্তা পাঠানো মিউটেশন ───
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, type, file }: { content: string; type: string; file?: File }) => {
      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('content', content)
        formData.append('type', type)
        if (replyingTo) formData.append('repliedToId', replyingTo.id)
        const res = await fetch(`/api/whatsapp/conversations/${selectedConversationId}/messages?XTransformPort=3006`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${useAppStore.getState().token}` },
          body: formData,
        })
        return res.json()
      }
      return api.post(`/api/whatsapp/conversations/${selectedConversationId}/messages`, {
        content,
        type,
        repliedToId: replyingTo?.id,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wa-messages', selectedConversationId] })
      queryClient.invalidateQueries({ queryKey: ['wa-conversations'] })
      setReplyingTo(null)
    },
    onError: (err: any) => {
      toast({ title: err.message || 'Failed to send message', variant: 'destructive' })
    },
  })

  // ─── পঠিত হিসেবে চিহ্নিত ───
  const markReadMutation = useMutation({
    mutationFn: async (convId: string) => {
      return api.put(`/api/whatsapp/conversations/${convId}/read`, {})
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wa-conversations'] })
      queryClient.invalidateQueries({ queryKey: ['wa-conversation', selectedConversationId] })
    },
  })

  // ─── নির্বাচনে স্বয়ংক্রিয়ভাবে পঠিত হিসেবে চিহ্নিত ───
  useEffect(() => {
    if (selectedConversationId) {
      const conv = conversations.find(c => c.id === selectedConversationId)
      if (conv && conv.unreadCount > 0) {
        markReadMutation.mutate(selectedConversationId)
      }
    }
  }, [selectedConversationId])

  // ─── নতুন বার্তায় নিচে স্ক্রল ───
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length])

  // ─── গণনাকৃত ট্যাব গণনা ───
  const tabCounts = useMemo<TabCounts>(() => {
    const counts: TabCounts = { all: conversations.length, unread: 0, open: 0, assigned: 0, mine: 0, has_ticket: 0 }
    for (const c of conversations) {
      if (c.unreadCount > 0) counts.unread++
      if (c.status === 'open') counts.open++
      if (c.assignedToId) counts.assigned++
      if (c.assignedToId === user?.id) counts.mine++
      if (c.ticketId) counts.has_ticket++
    }
    return counts
  }, [conversations, user?.id])

  // ─── নির্বাচিত কথোপকথনের তথ্য ───
  const selectedConversation = conversations.find(c => c.id === selectedConversationId)
  const contactData = conversationDetail?.contact || selectedConversation?.contact

  // ─── তারিখ অনুযায়ী বার্তা গোষ্ঠীবদ্ধ করা ───
  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: WhatsAppMessage[] }[] = []
    let currentDate = ''

    for (const msg of messages) {
      const msgDate = new Date(msg.createdAt).toDateString()
      if (msgDate !== currentDate) {
        currentDate = msgDate
        groups.push({ date: msg.createdAt, messages: [msg] })
      } else {
        groups[groups.length - 1].messages.push(msg)
      }
    }
    return groups
  }, [messages])

  // ─── হ্যান্ডলারসমূহ ───
  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id)
    setReplyingTo(null)
    setMobileView('chat')
  }

  const handleSendMessage = (content: string, type: 'text' | 'image' | 'document' | 'video' | 'audio', file?: File) => {
    sendMessageMutation.mutate({ content, type, file })
  }

  const handleBackToList = () => {
    setMobileView('list')
  }

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['wa-conversations'] })
    queryClient.invalidateQueries({ queryKey: ['wa-conversation', selectedConversationId] })
    queryClient.invalidateQueries({ queryKey: ['wa-messages', selectedConversationId] })
  }

  const handleNavigateToTicket = (ticketId: string) => {
    navigate('maintenance-ticket-detail', { id: ticketId })
  }

  const handleNavigateToCustomer = (customerId: string) => {
    navigate('customers', { id: customerId })
  }

  const handleStarMessage = (messageId: string) => {
    api.put(`/api/whatsapp/messages/${messageId}`, { isStarred: true }).then(() => {
      queryClient.invalidateQueries({ queryKey: ['wa-messages', selectedConversationId] })
    })
  }

  // ─── ফাঁকা চ্যাট অবস্থা ───
  const renderEmptyChat = () => (
    <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50">
      <div className="text-center space-y-3 px-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <MessageSquare className="h-9 w-9 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">WhatsApp Inbox</h3>
          <p className="text-sm text-gray-500 mt-1">
            Select a conversation from the left panel to start chatting with customers.
          </p>
        </div>
        {!isConnected && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-red-500">
            <WifiOff className="h-3.5 w-3.5" />
            Real-time disconnected
          </div>
        )}
      </div>
    </div>
  )

  // ─── চ্যাট লোডিং স্কেলেটন ───
  const renderChatSkeleton = () => (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-950">
      <Skeleton className="h-16 border-b border-gray-200 dark:border-gray-800" />
      <div className="flex-1 p-4 space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={cn('flex gap-2', i % 2 === 0 ? 'justify-start' : 'justify-end')}>
            <Skeleton className={cn('h-16 rounded-2xl', i % 2 === 0 ? 'w-3/5' : 'w-2/5')} />
          </div>
        ))}
      </div>
    </div>
  )

  // ─── চ্যাট দৃশ্য ───
  const renderChatView = () => {
    if (!selectedConversationId || !selectedConversation) return renderEmptyChat()
    if (msgsLoading && messages.length === 0) return renderChatSkeleton()

    const contactName = selectedConversation.contact?.name || selectedConversation.contact?.pushName || selectedConversation.contact?.phone || 'Unknown'

    return (
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-950 min-w-0">
        {/* চ্যাট হেডার */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* মোবাইল ব্যাক বাটন */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9 flex-shrink-0"
              onClick={handleBackToList}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <Avatar className="h-10 w-10 flex-shrink-0">
              {selectedConversation.contact?.profilePicUrl && (
                <img src={selectedConversation.contact.profilePicUrl} alt={contactName} className="object-cover w-full h-full rounded-full" />
              )}
              <AvatarFallback className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                {(selectedConversation.contact?.name || selectedConversation.contact?.phone || '??').substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{contactName}</h3>
              <p className="text-xs text-gray-500 truncate">{selectedConversation.contact?.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {/* সংযোগ সূচক */}
            <Tooltip>
              <TooltipTrigger>
                {isConnected ? (
                  <Wifi className="h-4 w-4 text-emerald-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-400" />
                )}
              </TooltipTrigger>
              <TooltipContent>
                {isConnected ? 'Connected' : 'Disconnected'}
              </TooltipContent>
            </Tooltip>

            {/* পঠিত হিসেবে চিহ্নিত */}
            {selectedConversation.unreadCount > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => markReadMutation.mutate(selectedConversationId)}>
                    <CheckCheck className="h-4 w-4 text-emerald-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Mark as read</TooltipContent>
              </Tooltip>
            )}

            {/* ডান প্যানেল টগল */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hidden lg:flex"
                  onClick={() => setShowRightPanel(!showRightPanel)}
                >
                  {showRightPanel ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{showRightPanel ? 'Hide details' : 'Show details'}</TooltipContent>
            </Tooltip>

            {/* তথ্য / মোবাইলে বিস্তারিত শিট খোলা */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 lg:hidden"
                  onClick={() => setDetailSheetOpen(true)}
                >
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Details</TooltipContent>
            </Tooltip>

            {/* আরো কার্যকলাপ */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => markReadMutation.mutate(selectedConversationId)}>
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark as Read
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Star className="h-4 w-4 mr-2" />
                  Star Conversation
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <Archive className="h-4 w-4 mr-2" />
                  Archive Chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* বার্তা এলাকা */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-3 py-3 bg-[#efeae2] dark:bg-gray-900 space-y-0.5"
        >
          {messages.length === 0 && !msgsLoading && (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-gray-400">No messages yet</p>
            </div>
          )}

          {groupedMessages.map((group) => (
            <React.Fragment key={group.date}>
              <DateSeparator date={group.date} />
              {group.messages.map((msg) => (
                <WhatsAppMessageBubble
                  key={msg.id}
                  message={msg}
                  onReply={(m) => setReplyingTo(m)}
                  onStar={handleStarMessage}
                />
              ))}
            </React.Fragment>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* বার্তা ইনপুট */}
        <WhatsAppMessageInput
          onSend={handleSendMessage}
          onTyping={() => emitTyping(selectedConversationId)}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          disabled={sendMessageMutation.isPending}
        />
      </div>
    )
  }

  // ─── প্রধান বিন্যাস ───
  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-background">
      {/* সংযোগ স্ট্যাটাস ও রিফ্রেশসহ শীর্ষ বার */}
      <div className="h-11 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex-shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-emerald-600" />
          <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100">WhatsApp Inbox</h1>
          <span className="text-xs text-gray-400">
            ({tabCounts.all} conversations)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className={cn(
              'text-[10px] px-2 py-0.5 gap-1',
              isConnected
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
            )}
          >
            <Circle className={cn('h-1.5 w-1.5 fill-current', isConnected ? 'text-emerald-500' : 'text-red-500')} />
            {isConnected ? 'Live' : 'Offline'}
          </Badge>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleRefresh}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* ৩-প্যানেল বিন্যাস */}
      <div className="flex-1 flex overflow-hidden">
        {/* বাম প্যানেল - কথোপকথন তালিকা */}
        <div className={cn(
          'w-full lg:w-80 xl:w-96 border-r border-gray-200 dark:border-gray-800 flex flex-col bg-white dark:bg-gray-950 flex-shrink-0',
          mobileView === 'chat' ? 'hidden lg:flex' : 'flex'
        )}>
          {/* অনুসন্ধান */}
          <div className="p-3 pb-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search conversations…"
                className="pl-9 h-9 text-sm"
              />
            </div>
          </div>

          {/* ফিল্টার ট্যাব */}
          <div className="px-3 pt-2">
            <Tabs value={activeFilter} onValueChange={v => setActiveFilter(v as FilterTab)}>
              <TabsList className="w-full h-8 bg-gray-100 dark:bg-gray-800 p-0.5">
                <TabsTrigger value="all" className="text-[11px] h-7 flex-1 gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                  All
                  {tabCounts.all > 0 && (
                    <span className={cn(
                      'text-[9px] min-w-[14px] h-[14px] rounded-full flex items-center justify-center px-1',
                      activeFilter === 'all' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' : 'text-gray-500'
                    )}>
                      {tabCounts.all}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="unread" className="text-[11px] h-7 flex-1 gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                  Unread
                  {tabCounts.unread > 0 && (
                    <span className={cn(
                      'text-[9px] min-w-[14px] h-[14px] rounded-full flex items-center justify-center px-1',
                      activeFilter === 'unread' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-emerald-500 text-white'
                    )}>
                      {tabCounts.unread}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="open" className="text-[11px] h-7 flex-1 gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                  Open
                  {tabCounts.open > 0 && (
                    <span className={cn(
                      'text-[9px] min-w-[14px] h-[14px] rounded-full flex items-center justify-center px-1',
                      activeFilter === 'open' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' : 'text-gray-500'
                    )}>
                      {tabCounts.open}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="mine" className="text-[11px] h-7 flex-1 gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                  Mine
                  {tabCounts.mine > 0 && (
                    <span className={cn(
                      'text-[9px] min-w-[14px] h-[14px] rounded-full flex items-center justify-center px-1',
                      activeFilter === 'mine' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' : 'text-gray-500'
                    )}>
                      {tabCounts.mine}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="has_ticket" className="text-[11px] h-7 flex-1 gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                  <span className="hidden sm:inline">Ticket</span>
                  <Link2 className="sm:hidden h-3 w-3" />
                  {tabCounts.has_ticket > 0 && (
                    <span className={cn(
                      'text-[9px] min-w-[14px] h-[14px] rounded-full flex items-center justify-center px-1',
                      activeFilter === 'has_ticket' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' : 'text-gray-500'
                    )}>
                      {tabCounts.has_ticket}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* কথোপকথন তালিকা */}
          <ScrollArea className="flex-1 mt-2">
            {convLoading ? (
              <div className="space-y-0">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-3 border-b border-gray-50 dark:border-gray-800/50">
                    <Skeleton className="h-11 w-11 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3.5 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <MessageSquare className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm text-gray-500 text-center">No conversations found</p>
                {searchQuery && (
                  <Button variant="link" className="text-xs mt-2" onClick={() => setSearchQuery('')}>
                    Clear search
                  </Button>
                )}
              </div>
            ) : (
              <div>
                {conversations.map((conv) => (
                  <WhatsAppConversationItem
                    key={conv.id}
                    conversation={conv}
                    isActive={conv.id === selectedConversationId}
                    onClick={handleSelectConversation}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* কেন্দ্রীয় প্যানেল - চ্যাট দৃশ্য */}
        <div className={cn(
          'flex-1 flex flex-col min-w-0',
          mobileView === 'list' ? 'hidden lg:flex' : 'flex'
        )}>
          {renderChatView()}
        </div>

        {/* ডান প্যানেল - বিবরণ (শুধুমাত্র ডেস্কটপ) */}
        {selectedConversationId && conversationDetail && showRightPanel && (
          <div className="hidden lg:flex w-80 xl:w-96 flex-shrink-0">
            <WhatsAppInboxDetail
              conversation={conversationDetail}
              contact={conversationDetail.contact || contactData}
              messages={messages}
              onAssign={() => {}}
              onConvert={() => {}}
              onTransfer={() => {}}
              onClose={() => setSelectedConversationId(null)}
              onRefresh={handleRefresh}
              onNavigateToTicket={handleNavigateToTicket}
              onNavigateToCustomer={handleNavigateToCustomer}
            />
          </div>
        )}
      </div>

      {/* মোবাইল বিস্তারিত শিট */}
      {selectedConversationId && conversationDetail && (
        <Sheet open={detailSheetOpen} onOpenChange={setDetailSheetOpen}>
          <SheetContent side="right" className="w-80 p-0">
            <SheetHeader className="p-4 pb-0">
              <SheetTitle className="text-sm">Conversation Details</SheetTitle>
            </SheetHeader>
            <div className="mt-2">
              <WhatsAppInboxDetail
                conversation={conversationDetail}
                contact={conversationDetail.contact || contactData}
                messages={messages}
                onAssign={() => {}}
                onConvert={() => {}}
                onTransfer={() => {}}
                onClose={() => { setSelectedConversationId(null); setDetailSheetOpen(false) }}
                onRefresh={handleRefresh}
                onNavigateToTicket={handleNavigateToTicket}
                onNavigateToCustomer={handleNavigateToCustomer}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}
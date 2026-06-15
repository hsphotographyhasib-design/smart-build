'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Loader2, UserPlus, Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

interface Agent {
  id: string
  name: string
  role: string
  avatarUrl?: string | null
  email?: string | null
}

interface WhatsAppAssignDialogProps {
  conversationId: string
  currentAssigneeId?: string | null
  currentAssigneeName?: string
  isTransfer?: boolean
  onSuccess?: () => void
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.substring(0, 2).toUpperCase()
}

export function WhatsAppAssignDialog({
  conversationId,
  currentAssigneeId,
  currentAssigneeName,
  isTransfer = false,
  onSuccess,
  trigger,
  open,
  onOpenChange,
}: WhatsAppAssignDialogProps) {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('')
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { toast } = useToast()

  const { data: agentsData, isLoading: agentsLoading } = useQuery({
    queryKey: ['whatsapp-agents'],
    queryFn: async () => {
      const res = await api.get<Agent[]>('/api/maintenance/whatsapp/agents')
      if (res.success) return res.data || []
      return []
    },
  })

  const agents = agentsData || []

  const filteredAgents = agents.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSubmit = async () => {
    if (!selectedAgentId) {
      toast({ title: 'Please select an agent', variant: 'destructive' })
      return
    }

    setIsSubmitting(true)
    try {
      const res = await api.post('/api/maintenance/whatsapp/assign', {
        conversationId,
        assignToId: selectedAgentId,
        isTransfer,
        note: note || undefined,
      })

      if (res.success) {
        toast({
          title: isTransfer
            ? 'Chat transferred successfully'
            : 'Agent assigned successfully',
        })
        onSuccess?.()
        onOpenChange?.(false)
        setSelectedAgentId('')
        setNote('')
        setSearchQuery('')
      } else {
        toast({ title: res.error || 'Failed to assign', variant: 'destructive' })
      }
    } catch (err: any) {
      toast({ title: err.message || 'An error occurred', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-1.5">
            <UserPlus className="h-3.5 w-3.5" />
            {isTransfer ? 'Transfer' : 'Assign'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isTransfer ? 'Transfer Chat' : 'Assign to Agent'}</DialogTitle>
        </DialogHeader>

        {currentAssigneeId && currentAssigneeName && (
          <p className="text-sm text-gray-500">
            Currently assigned to: <span className="font-medium text-gray-700 dark:text-gray-300">{currentAssigneeName}</span>
          </p>
        )}

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search agents…"
              className="pl-9 h-9 text-sm"
            />
          </div>

          {/* Agent list */}
          <ScrollArea className="max-h-60">
            {agentsLoading ? (
              <div className="space-y-2 py-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredAgents.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No agents found</p>
            ) : (
              <div className="space-y-1">
                {filteredAgents.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgentId(agent.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                      selectedAgentId === agent.id
                        ? 'bg-amber-50 dark:bg-amber-900/20 ring-1 ring-amber-500/50'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    )}
                  >
                    <Avatar className="h-9 w-9 flex-shrink-0">
                      <AvatarFallback className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                        {getInitials(agent.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">{agent.name}</p>
                      <p className="text-xs text-gray-500">{agent.role}</p>
                    </div>
                    {selectedAgentId === agent.id && (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                        <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Transfer note */}
          {isTransfer && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Transfer Note (optional)</Label>
              <Textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={2}
                placeholder="Add context for the receiving agent…"
                className="text-sm resize-none"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={() => onOpenChange?.(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedAgentId}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  {isTransfer ? 'Transferring…' : 'Assigning…'}
                </>
              ) : (
                isTransfer ? 'Transfer Chat' : 'Assign'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
'use client'

import React, { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/store'
import { Loader2, ArrowRightLeft } from 'lucide-react'

const CONVERT_TYPES = [
  { value: 'complaint', label: 'Complaint / Service Request' },
  { value: 'work_order', label: 'Work Order' },
  { value: 'quotation', label: 'Quotation' },
  { value: 'amc', label: 'AMC Contract' },
]

const CATEGORIES = [
  { value: 'air_conditioning', label: 'Air Conditioning' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'fire_protection', label: 'Fire Protection' },
  { value: 'mechanical', label: 'Mechanical' },
  { value: 'civil', label: 'Civil' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'security', label: 'Security' },
  { value: 'it', label: 'IT' },
  { value: 'general_maintenance', label: 'General Maintenance' },
  { value: 'other', label: 'Other' },
]

const PRIORITIES = [
  { value: 'emergency', label: 'Emergency' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

interface WhatsAppConvertDialogProps {
  conversationId: string
  contactPhone: string
  contactName: string
  lastMessages?: { content?: string | null }[]
  customerId?: string | null
  siteId?: string | null
  onSuccess?: (ticketId: string) => void
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function WhatsAppConvertDialog({
  conversationId,
  contactPhone,
  contactName,
  lastMessages,
  customerId,
  siteId,
  onSuccess,
  trigger,
  open,
  onOpenChange,
}: WhatsAppConvertDialogProps) {
  const [convertType, setConvertType] = useState('complaint')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState('medium')
  const [selectedSiteId, setSelectedSiteId] = useState<string>(siteId || '')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // শেষ বার্তা থেকে বিবরণ তৈরি
  const handleOpen = (isOpen: boolean) => {
    if (isOpen && !description) {
      const textParts = (lastMessages || [])
        .filter(m => m.content)
        .map(m => m.content!)
        .slice(-5)
        .join('\n\n')
      setDescription(`[From WhatsApp chat with ${contactName} (${contactPhone})]\n\n${textParts}`)
    }
    onOpenChange?.(isOpen)
  }

  const handleSubmit = async () => {
    if (!category) {
      toast({ title: 'Please select a category', variant: 'destructive' })
      return
    }

    setIsSubmitting(true)
    try {
      const res = await api.post('/api/whatsapp/convert', {
        conversationId,
        convertType,
        category,
        priority,
        siteId: selectedSiteId || null,
        description,
        customerId: customerId || null,
      })

      if (res.success) {
        toast({ title: `${convertType === 'complaint' ? 'Ticket' : convertType === 'work_order' ? 'Work Order' : convertType === 'quotation' ? 'Quotation' : 'AMC'} created successfully` })
        onSuccess?.(res.data?.id || res.data?.ticketId || '')
        onOpenChange?.(false)
      } else {
        toast({ title: res.error || 'Failed to create', variant: 'destructive' })
      }
    } catch (err: any) {
      toast({ title: err.message || 'An error occurred', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-1.5">
            <ArrowRightLeft className="h-3.5 w-3.5" />
            Convert
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Convert to Ticket / Work Order</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* রূপান্তরের প্রকার */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Type</Label>
            <Select value={convertType} onValueChange={setConvertType}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONVERT_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* বিভাগ */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* অগ্রাধিকার */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* বিবরণ */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Description</Label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={6}
              placeholder="Ticket description…"
              className="text-sm resize-none"
            />
          </div>

          {/* কার্যকলাপ */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange?.(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !category} className="bg-emerald-600 hover:bg-emerald-700">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  Creating…
                </>
              ) : (
                `Create ${convertType === 'complaint' ? 'Ticket' : convertType === 'work_order' ? 'Work Order' : convertType === 'quotation' ? 'Quotation' : 'AMC'}`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
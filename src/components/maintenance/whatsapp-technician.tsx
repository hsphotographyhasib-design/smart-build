'use client'

import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api, useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import {
  Radio, Clock, AlertTriangle, Phone, CheckCircle2, ArrowRight,
  MessageSquare, UserCheck, Star, Wrench, MapPin,
} from 'lucide-react'

// ─── Types ───
interface Technician {
  id: string
  user: {
    id: string
    name: string
    phone?: string | null
    email?: string | null
    avatar?: string | null
  } | null
  specializations: string[]
  availabilityStatus: string
  rating: number
  activeJobs: number
  activePMSchedules?: number
  location?: string | null
  employee?: {
    department?: string | null
    designation?: string | null
  } | null
}

type FilterTab = 'available' | 'on_site' | 'all'

// ─── Config ───
const statusConfig: Record<string, { label: string; color: string; dot: string; cardBorder: string }> = {
  available: {
    label: 'Available',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    dot: 'bg-emerald-500',
    cardBorder: 'border-l-emerald-500',
  },
  busy: {
    label: 'Busy',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    dot: 'bg-amber-500',
    cardBorder: 'border-l-amber-500',
  },
  on_site: {
    label: 'On Site',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    dot: 'bg-amber-500',
    cardBorder: 'border-l-amber-500',
  },
  offline: {
    label: 'Offline',
    color: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
    dot: 'bg-gray-400',
    cardBorder: 'border-l-gray-400',
  },
  on_leave: {
    label: 'On Leave',
    color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    dot: 'bg-sky-500',
    cardBorder: 'border-l-sky-500',
  },
}

// ─── Skeletons ───
function CardSkeleton() {
  return (
    <Card className="border-l-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Star Rating ───
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'h-3.5 w-3.5',
            i < Math.round(rating)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-muted text-muted'
          )}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground font-medium">{rating.toFixed(1)}</span>
    </div>
  )
}

// ─── Technician Card ───
function TechnicianCard({ tech }: { tech: Technician }) {
  const { navigate } = useAppStore()
  const cfg = statusConfig[tech.availabilityStatus] || statusConfig.offline
  const name = tech.user?.name || 'Unknown'
  const phone = tech.user?.phone || null
  const location = tech.location || null
  const designation = tech.employee?.designation || null

  return (
    <Card className={cn('border-l-4 transition-shadow hover:shadow-md', cfg.cardBorder)}>
      <CardContent className="p-4">
        {/* Top row: Avatar + Name + Status */}
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-semibold text-sm text-muted-foreground shrink-0">
            {name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-sm truncate">{name}</h3>
              <Badge className={cn('text-[10px] gap-1 px-1.5 py-0', cfg.color)}>
                <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
                {cfg.label}
              </Badge>
            </div>
            {designation && (
              <p className="text-xs text-muted-foreground mt-0.5">{designation}</p>
            )}
            {phone && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Phone className="h-3 w-3" />
                {phone}
              </p>
            )}
          </div>
        </div>

        {/* Specializations */}
        {tech.specializations && tech.specializations.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {tech.specializations.slice(0, 4).map((spec) => (
              <Badge key={spec} variant="outline" className="text-[10px] font-normal">
                {spec}
              </Badge>
            ))}
            {tech.specializations.length > 4 && (
              <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground">
                +{tech.specializations.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* Location */}
        {location && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
            <MapPin className="h-3 w-3" />
            {location}
          </p>
        )}

        {/* Bottom row: Rating + Active Jobs */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <StarRating rating={tech.rating} />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Wrench className="h-3 w-3" />
              <span className="font-medium text-foreground">{tech.activeJobs}</span>
              <span>active</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1"
              onClick={() => navigate('maintenance-technicians')}
            >
              <MessageSquare className="h-3 w-3" />
              Chat
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Empty State ───
function EmptyState({ tab }: { tab: FilterTab }) {
  const messages: Record<FilterTab, { title: string; desc: string }> = {
    available: {
      title: 'No available technicians',
      desc: 'All technicians are currently busy or offline.',
    },
    on_site: {
      title: 'No technicians on site',
      desc: 'No technicians are currently working on site.',
    },
    all: {
      title: 'No technicians found',
      desc: 'No technician profiles have been created yet.',
    },
  }

  return (
    <Card>
      <CardContent className="py-16 text-center">
        <UserCheck className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
        <p className="font-semibold text-muted-foreground">{messages[tab].title}</p>
        <p className="text-sm text-muted-foreground/70 mt-1">{messages[tab].desc}</p>
      </CardContent>
    </Card>
  )
}

// ─── Main Component ───
export function WhatsAppTechnicianPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('available')

  const { data: techData, isLoading } = useQuery({
    queryKey: ['wa-technicians', activeTab],
    queryFn: () => {
      const params = activeTab === 'available'
        ? '?availabilityStatus=available'
        : activeTab === 'on_site'
          ? '?availabilityStatus=busy'
          : ''
      return api.get<Technician[]>(`/api/maintenance/technicians${params}`)
    },
  })

  const technicians = techData?.success ? techData.data ?? [] : []

  const stats = useMemo(() => {
    const available = technicians.filter((t) => t.availabilityStatus === 'available').length
    const onSite = technicians.filter((t) => t.availabilityStatus === 'busy' || t.availabilityStatus === 'on_site').length
    return { available, onSite, total: technicians.length }
  }, [technicians])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
            <UserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">WhatsApp Technician Portal</h1>
            <p className="text-sm text-muted-foreground">Technician communication and status updates</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FilterTab)}>
        <TabsList>
          <TabsTrigger value="available" className="gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Available
            {!isLoading && stats.available > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1.5 text-[10px]">
                {stats.available}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="on_site" className="gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            On Site
            {!isLoading && stats.onSite > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1.5 text-[10px]">
                {stats.onSite}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-1.5">
            <Radio className="h-3.5 w-3.5" />
            All
            {!isLoading && stats.total > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1.5 text-[10px]">
                {stats.total}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Technician Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : technicians.length === 0 ? (
        <EmptyState tab={activeTab} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {technicians.map((tech) => (
            <TechnicianCard key={tech.id} tech={tech} />
          ))}
        </div>
      )}
    </div>
  )
}

export default WhatsAppTechnicianPage
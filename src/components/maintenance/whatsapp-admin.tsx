'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import {
  MessageSquare, Settings, QrCode, Bell, Smartphone, Shield, Globe,
  Bot, RefreshCw, Wifi, WifiOff, CheckCircle2, XCircle, Clock,
  Plus, Save, Phone, Wrench,
} from 'lucide-react'

// ─── Types ───
interface WhatsAppAccount {
  id: string
  name: string
  phoneNumber: string
  status: 'connected' | 'disconnected' | 'scanning'
  sessionId?: string | null
  isActive: boolean
  lastSyncAt?: string | null
  qrCode?: string | null
}

interface MessageTemplate {
  id: string
  name: string
  displayName: string
  category: string
  language: string
  bodyText: string
  isActive: boolean
  createdAt: string
}

type AdminTab = 'sessions' | 'webhook' | 'templates' | 'departments' | 'bot'

interface WebhookEvent {
  id: string
  label: string
  enabled: boolean
}

interface BotSetting {
  key: string
  label: string
  description: string
  enabled: boolean
}

// ─── Config ───
const sessionStatusConfig: Record<string, { label: string; color: string; dot: string; icon: React.ElementType }> = {
  connected: {
    label: 'Connected',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    dot: 'bg-emerald-500',
    icon: Wifi,
  },
  disconnected: {
    label: 'Disconnected',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    dot: 'bg-red-500',
    icon: WifiOff,
  },
  scanning: {
    label: 'Scanning QR...',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    dot: 'bg-amber-500',
    icon: QrCode,
  },
}

const webhookEvents: WebhookEvent[] = [
  { id: 'message_received', label: 'Message Received', enabled: true },
  { id: 'message_sent', label: 'Message Sent', enabled: true },
  { id: 'status_update', label: 'Status Update', enabled: false },
  { id: 'media_uploaded', label: 'Media Uploaded', enabled: false },
  { id: 'contact_added', label: 'Contact Added', enabled: true },
  { id: 'group_event', label: 'Group Events', enabled: false },
  { id: 'session_state', label: 'Session State Changes', enabled: true },
  { id: 'ticket_created', label: 'Ticket Auto-Created', enabled: true },
]

const botCommands = [
  { command: 'STATUS', description: 'Check current ticket status', example: 'STATUS #TKT-001' },
  { command: 'MY REQUESTS', description: 'List all your open requests', example: 'MY REQUESTS' },
  { command: 'HELP', description: 'Show available commands', example: 'HELP' },
]

const departmentNumbers = [
  { name: 'Maintenance', phone: '+91 98765 43210', icon: Wrench },
  { name: 'Projects', phone: '+91 98765 43211', icon: Globe },
  { name: 'Sales', phone: '+91 98765 43212', icon: Bell },
  { name: 'Support', phone: '+91 98765 43213', icon: Shield },
]

// ─── Skeletons ───
function SessionCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-6 w-24" />
        </div>
        <Separator className="my-3" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-28" />
        </div>
      </CardContent>
    </Card>
  )
}

function TemplateRowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
    </TableRow>
  )
}

// ─── Sessions Tab ───
function SessionsTab({ account, isLoading, onRefresh }: {
  account: WhatsAppAccount | null
  isLoading: boolean
  onRefresh: () => void
}) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [qrLoading, setQrLoading] = useState(false)
  const [qrData, setQrData] = useState<string | null>(null)

  const startSessionMutation = useMutation({
    mutationFn: () => api.post<{ qr?: string; base64?: string }>('/api/whatsapp/qr'),
    onSuccess: (res) => {
      if (res.success) {
        const qr = res.data?.qr || res.data?.base64 || null
        setQrData(qr)
        queryClient.invalidateQueries({ queryKey: ['wa-account'] })
        toast({ title: 'Session started', description: 'Scan the QR code with WhatsApp.' })
      } else {
        toast({ title: 'Failed', description: res.error || 'Could not start session.', variant: 'destructive' })
      }
      setQrLoading(false)
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to start session.', variant: 'destructive' })
      setQrLoading(false)
    },
  })

  const disconnectMutation = useMutation({
    mutationFn: () => api.del('/api/whatsapp/account'),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['wa-account'] })
        toast({ title: 'Disconnected', description: 'WhatsApp session stopped.' })
      }
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to disconnect.', variant: 'destructive' })
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SessionCardSkeleton />
      </div>
    )
  }

  if (!account) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Smartphone className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="font-medium text-muted-foreground">No WhatsApp account configured</p>
          <p className="text-sm text-muted-foreground/70 mt-1 mb-4">Start a session to connect your WhatsApp Business number.</p>
          <Button
            onClick={() => {
              setQrLoading(true)
              startSessionMutation.mutate()
            }}
            disabled={qrLoading}
            className="gap-2"
          >
            {qrLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
            {qrLoading ? 'Starting...' : 'Start Session'}
          </Button>
        </CardContent>
      </Card>
    )
  }

  const statusCfg = sessionStatusConfig[account.status] || sessionStatusConfig.disconnected
  const StatusIcon = statusCfg.icon

  return (
    <div className="space-y-4">
      {/* Session Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                <StatusIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{account.name || 'WhatsApp Business'}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {account.phoneNumber || 'Not set'}
                </p>
              </div>
            </div>
            <Badge className={cn('gap-1', statusCfg.color)}>
              <span className={cn('h-1.5 w-1.5 rounded-full', statusCfg.dot)} />
              {statusCfg.label}
            </Badge>
          </div>

          <Separator className="my-4" />

          {/* QR Code Section */}
          {qrData && (
            <div className="mb-4 p-4 bg-muted/50 rounded-lg text-center">
              <p className="text-xs text-muted-foreground mb-2">Scan this QR code with WhatsApp</p>
              <img src={qrData} alt="WhatsApp QR Code" className="mx-auto max-w-[200px] rounded" />
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={onRefresh}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh Status
            </Button>

            {(account.status === 'disconnected' || !account.sessionId) && (
              <Button
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => {
                  setQrLoading(true)
                  startSessionMutation.mutate()
                }}
                disabled={qrLoading}
              >
                {qrLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <QrCode className="h-3.5 w-3.5" />}
                {qrLoading ? 'Starting...' : 'Connect / Scan QR'}
              </Button>
            )}

            {account.status === 'scanning' && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs"
                onClick={() => {
                  setQrLoading(true)
                  startSessionMutation.mutate()
                }}
                disabled={qrLoading}
              >
                {qrLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                Regenerate QR
              </Button>
            )}

            {account.status === 'connected' && (
              <Button
                size="sm"
                variant="destructive"
                className="gap-1.5 text-xs"
                onClick={() => disconnectMutation.mutate()}
                disabled={disconnectMutation.isPending}
              >
                {disconnectMutation.isPending ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                Disconnect
              </Button>
            )}
          </div>

          {account.lastSyncAt && (
            <p className="text-[11px] text-muted-foreground mt-3">
              Last sync: {new Date(account.lastSyncAt).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Webhook Tab ───
function WebhookTab() {
  const [events, setEvents] = useState<WebhookEvent[]>(webhookEvents)
  const [webhookUrl, setWebhookUrl] = useState('https://api.smartbuild.com/webhooks/whatsapp')
  const { toast } = useToast()

  const toggleEvent = (id: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, enabled: !e.enabled } : e))
    )
  }

  const handleSave = () => {
    toast({ title: 'Webhook saved', description: `${events.filter((e) => e.enabled).length} events enabled.` })
  }

  return (
    <div className="space-y-4">
      {/* Webhook URL */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Globe className="h-4 w-4 text-amber-500" />
            Webhook URL
          </CardTitle>
          <CardDescription className="text-xs">
            Incoming webhook endpoint for WhatsApp events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="text-sm font-mono"
              placeholder="https://your-domain.com/webhooks/whatsapp"
            />
            <Button size="sm" className="gap-1.5 shrink-0" onClick={handleSave}>
              <Save className="h-3.5 w-3.5" />
              Save
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Event Subscriptions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bell className="h-4 w-4 text-amber-500" />
            Event Subscriptions
          </CardTitle>
          <CardDescription className="text-xs">
            Select which events should trigger webhook calls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="flex items-center justify-between py-1.5">
              <Label htmlFor={event.id} className="text-sm cursor-pointer">
                {event.label}
              </Label>
              <Switch
                id={event.id}
                checked={event.enabled}
                onCheckedChange={() => toggleEvent(event.id)}
              />
            </div>
          ))}
          <Separator />
          <div className="flex justify-end">
            <Button size="sm" className="gap-1.5 text-xs" onClick={handleSave}>
              <Save className="h-3.5 w-3.5" />
              Save Events
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Templates Tab ───
function TemplatesTab() {
  const { toast } = useToast()

  const { data: templatesData, isLoading } = useQuery({
    queryKey: ['wa-templates'],
    queryFn: () => api.get<MessageTemplate[]>('/api/whatsapp/templates'),
  })

  const templates = templatesData?.success ? templatesData.data ?? [] : []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {templates.length} template{templates.length !== 1 ? 's' : ''}
        </p>
        <Button size="sm" className="gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" />
          Add Template
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Category</TableHead>
                  <TableHead className="hidden sm:table-cell">Language</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <>
                    <TemplateRowSkeleton />
                    <TemplateRowSkeleton />
                    <TemplateRowSkeleton />
                  </>
                ) : templates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center">
                      <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                      <p className="text-sm text-muted-foreground">No templates yet</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  templates.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{t.displayName || t.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{t.name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className="text-xs capitalize">
                          {t.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-xs text-muted-foreground uppercase">
                        {t.language}
                      </TableCell>
                      <TableCell>
                        {t.isActive ? (
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 gap-1 text-xs">
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1 text-xs">
                            <XCircle className="h-3 w-3" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Departments Tab ───
function DepartmentsTab() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Phone className="h-4 w-4 text-amber-500" />
            Department Numbers
          </CardTitle>
          <CardDescription className="text-xs">
            WhatsApp numbers mapped to each department
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {departmentNumbers.map((dept) => {
            const DeptIcon = dept.icon
            return (
              <div
                key={dept.name}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                    <DeptIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="text-sm font-medium">{dept.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground font-mono">{dept.phone}</span>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Bot Settings Tab ───
function BotSettingsTab() {
  const { toast } = useToast()
  const [botSettings, setBotSettings] = useState<BotSetting[]>([
    { key: 'auto_reply', label: 'Auto-Reply', description: 'Automatically respond to common queries when no agent is available', enabled: true },
    { key: 'auto_classify', label: 'Auto-Classification', description: 'Use AI to classify incoming messages by category and priority', enabled: true },
    { key: 'auto_ticket', label: 'Auto-Ticket Creation', description: 'Automatically create maintenance tickets from WhatsApp complaints', enabled: false },
  ])

  const toggleSetting = (key: string) => {
    setBotSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, enabled: !s.enabled } : s))
    )
  }

  const handleSave = () => {
    toast({ title: 'Bot settings saved', description: 'Changes applied to bot configuration.' })
  }

  return (
    <div className="space-y-4">
      {/* Toggles */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bot className="h-4 w-4 text-amber-500" />
            Bot Configuration
          </CardTitle>
          <CardDescription className="text-xs">
            Control how the WhatsApp bot handles incoming messages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {botSettings.map((setting) => (
            <div key={setting.key} className="flex items-start justify-between gap-4 py-1">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">{setting.label}</Label>
                <p className="text-xs text-muted-foreground">{setting.description}</p>
              </div>
              <Switch
                checked={setting.enabled}
                onCheckedChange={() => toggleSetting(setting.key)}
                className="mt-0.5"
              />
            </div>
          ))}
          <Separator />
          <div className="flex justify-end">
            <Button size="sm" className="gap-1.5 text-xs" onClick={handleSave}>
              <Save className="h-3.5 w-3.5" />
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bot Commands */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-amber-500" />
            Bot Commands
          </CardTitle>
          <CardDescription className="text-xs">
            Available commands that users can send via WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Command</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="hidden sm:table-cell">Example</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {botCommands.map((cmd) => (
                  <TableRow key={cmd.command}>
                    <TableCell>
                      <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded font-semibold text-amber-700 dark:text-amber-400">
                        {cmd.command}
                      </code>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {cmd.description}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <code className="text-xs font-mono text-muted-foreground">{cmd.example}</code>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Main Component ───
export function WhatsAppAdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('sessions')

  const { data: accountData, isLoading: accountLoading, refetch: refetchAccount } = useQuery({
    queryKey: ['wa-account'],
    queryFn: () => api.get<WhatsAppAccount>('/api/whatsapp/account'),
  })

  const account = accountData?.success ? accountData.data ?? null : null

  const tabConfig: { value: AdminTab; label: string; icon: React.ElementType }[] = [
    { value: 'sessions', label: 'Sessions', icon: Smartphone },
    { value: 'webhook', label: 'Webhook', icon: Globe },
    { value: 'templates', label: 'Templates', icon: MessageSquare },
    { value: 'departments', label: 'Departments', icon: Phone },
    { value: 'bot', label: 'Bot Settings', icon: Bot },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
            <Settings className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">WhatsApp Integration Settings</h1>
            <p className="text-sm text-muted-foreground">Manage OpenWA sessions, webhooks, and templates</p>
          </div>
        </div>
      </div>

      {/* Connection Status Banner */}
      {account && (
        <div
          className={cn(
            'flex items-center gap-3 rounded-lg border px-4 py-3 text-sm',
            account.status === 'connected'
              ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800'
              : account.status === 'scanning'
                ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800'
                : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800'
          )}
        >
          {account.status === 'connected' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : account.status === 'scanning' ? (
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
          )}
          <span className="font-medium">
            {account.status === 'connected'
              ? `Connected as ${account.name || account.phoneNumber}`
              : account.status === 'scanning'
                ? 'Waiting for QR scan...'
                : 'WhatsApp is disconnected'}
          </span>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AdminTab)}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          {tabConfig.map((tab) => {
            const TabIcon = tab.icon
            return (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5 text-xs">
                <TabIcon className="h-3.5 w-3.5" />
                {tab.label}
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>

      {/* Tab Content */}
      {activeTab === 'sessions' && (
        <SessionsTab
          account={account}
          isLoading={accountLoading}
          onRefresh={() => refetchAccount()}
        />
      )}
      {activeTab === 'webhook' && <WebhookTab />}
      {activeTab === 'templates' && <TemplatesTab />}
      {activeTab === 'departments' && <DepartmentsTab />}
      {activeTab === 'bot' && <BotSettingsTab />}
    </div>
  )
}

export default WhatsAppAdminPage
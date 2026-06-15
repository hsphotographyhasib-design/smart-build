'use client'
import { useState, useEffect, useMemo } from 'react'
import { useAppStore, api } from '@/lib/store'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Shield, Zap, Search, ToggleLeft, Info, Package, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

interface FeatureFlag {
  id: string
  key: string
  name: string
  description: string | null
  module: string
  enabled: boolean
  isBeta: boolean
  config: string | null
  createdAt: string
  updatedAt: string
}

interface SystemVersion {
  id: string
  version: string
  title: string
  releaseNotes: string
  releasedAt: string
  releasedBy: string | null
}

const MODULE_ICONS: Record<string, string> = {
  projects: '🏗️',
  finance: '💰',
  procurement: '🛒',
  hr: '👥',
  resources: '🔧',
  'cost-control': '📊',
  collaboration: '🤝',
  'client-portal': '🌐',
  ai: '🤖',
  sales: '📦',
  operations: '⚙️',
}

const MODULE_LABELS: Record<string, string> = {
  projects: 'Project Management',
  finance: 'Finance',
  procurement: 'Procurement',
  hr: 'Human Resources',
  resources: 'Resources',
  'cost-control': 'Cost Control',
  collaboration: 'Collaboration',
  'client-portal': 'Client Portal',
  ai: 'AI & Analytics',
  sales: 'Sales',
  operations: 'Operations',
}

export function FeatureUpdatesPage() {
  const { user } = useAppStore()
  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [version, setVersion] = useState<SystemVersion | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const [flagsRes, versionRes] = await Promise.all([
        api.get<FeatureFlag[]>('/api/feature-flags'),
        api.get<SystemVersion[]>('/api/system-versions'),
      ])
      if (!cancelled) {
        if (flagsRes.success) setFlags(flagsRes.data!)
        if (versionRes.success && versionRes.data!.length > 0) {
          setVersion(versionRes.data![0])
        }
        setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  async function handleToggle(flag: FeatureFlag, field: 'enabled' | 'isBeta') {
    setTogglingId(flag.id)
    const newValue = !flag[field]
    const res = await api.put('/api/feature-flags', {
      id: flag.id,
      [field]: newValue,
    })
    if (res.success) {
      setFlags((prev) =>
        prev.map((f) => (f.id === flag.id ? { ...f, [field]: newValue } : f))
      )
      toast.success(`${flag.name}: ${field === 'enabled' ? (newValue ? 'Enabled' : 'Disabled') : (newValue ? 'Marked as Beta' : 'Removed from Beta')}`)
    } else {
      toast.error(res.error || 'Failed to update flag')
    }
    setTogglingId(null)
  }

  const filteredFlags = useMemo(() => {
    if (!search.trim()) return flags
    const q = search.toLowerCase()
    return flags.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.key.toLowerCase().includes(q) ||
        f.module.toLowerCase().includes(q) ||
        (f.description && f.description.toLowerCase().includes(q))
    )
  }, [flags, search])

  const groupedFlags = useMemo(() => {
    const groups: Record<string, FeatureFlag[]> = {}
    for (const flag of filteredFlags) {
      if (!groups[flag.module]) groups[flag.module] = []
      groups[flag.module].push(flag)
    }
    // যৌক্তিক ক্রমে মডিউল সাজানো
    const moduleOrder = ['projects', 'finance', 'procurement', 'hr', 'resources', 'cost-control', 'collaboration', 'client-portal', 'ai', 'sales', 'operations']
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      const ai = moduleOrder.indexOf(a)
      const bi = moduleOrder.indexOf(b)
      if (ai !== -1 && bi !== -1) return ai - bi
      if (ai !== -1) return -1
      if (bi !== -1) return 1
      return a.localeCompare(b)
    })
    return sortedKeys.map((key) => ({ module: key, flags: groups[key] }))
  }, [filteredFlags])

  const totalFlags = flags.length
  const enabledFlags = flags.filter((f) => f.enabled).length
  const betaFlags = flags.filter((f) => f.isBeta).length

  if (loading) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl">
      {/* হেডার */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-6 w-6 text-amber-600" />
          Feature Management Center
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Control module visibility, feature toggles, and system versioning
        </p>
      </div>

      {/* সংস্করণ তথ্য কার্ড */}
      {version && (
        <Card className="border-amber-200 dark:border-amber-900 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
          <CardContent className="p-4 md:p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-amber-600 text-white p-2 mt-0.5">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{version.title}</h3>
                    <Badge variant="outline" className="text-xs font-mono">
                      v{version.version}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{version.releaseNotes}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Released on {new Date(version.releasedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                    {version.releasedBy && ` by ${version.releasedBy}`}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* পরিসংখ্যান কার্ড */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 p-2">
                <ToggleLeft className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalFlags}</p>
                <p className="text-xs text-muted-foreground">Total Features</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 dark:bg-green-900/50 text-green-600 p-2">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{enabledFlags}</p>
                <p className="text-xs text-muted-foreground">Enabled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 p-2">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{betaFlags}</p>
                <p className="text-xs text-muted-foreground">Beta Features</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* অনুসন্ধান */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search features by name, key, module, or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* মডিউল অনুযায়ী বৈশিষ্ট্য ফ্ল্যাগ */}
      {groupedFlags.map(({ module, flags: moduleFlags }) => (
        <Card key={module}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-lg">{MODULE_ICONS[module] || '📌'}</span>
              {MODULE_LABELS[module] || module}
              <Badge variant="secondary" className="text-xs ml-1">
                {moduleFlags.length} {moduleFlags.length === 1 ? 'feature' : 'features'}
              </Badge>
              <Badge
                variant={moduleFlags.every((f) => f.enabled) ? 'default' : 'secondary'}
                className={`text-xs ml-auto ${
                  moduleFlags.every((f) => f.enabled)
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                {moduleFlags.every((f) => f.enabled) ? 'All Active' : 'Partially Active'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-0">
              {moduleFlags.map((flag, idx) => (
                <div key={flag.id}>
                  {idx > 0 && <Separator className="my-0" />}
                  <div className="flex items-center justify-between py-3 gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{flag.name}</span>
                        {flag.isBeta && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/50 dark:text-purple-400 dark:border-purple-800"
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            Beta
                          </Badge>
                        )}
                        {!flag.enabled && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-900 dark:text-gray-500 dark:border-gray-700"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Disabled
                          </Badge>
                        )}
                      </div>
                      {flag.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{flag.description}</p>
                      )}
                      <p className="text-[10px] font-mono text-muted-foreground/60 mt-0.5">{flag.key}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {flag.isBeta && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-muted-foreground">Beta</span>
                          <Switch
                            checked={flag.isBeta}
                            onCheckedChange={() => handleToggle(flag, 'isBeta')}
                            disabled={togglingId === flag.id}
                            className="data-[state=checked]:bg-purple-600"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-muted-foreground">
                          {flag.enabled ? 'On' : 'Off'}
                        </span>
                        <Switch
                          checked={flag.enabled}
                          onCheckedChange={() => handleToggle(flag, 'enabled')}
                          disabled={togglingId === flag.id}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {groupedFlags.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Info className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No features match your search.</p>
            {search && (
              <Button
                variant="link"
                className="mt-2"
                onClick={() => setSearch('')}
              >
                Clear search
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* তথ্য ফুটার */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                <strong>Feature Flags</strong> allow administrators to enable or disable modules and features
                without code changes. Disabled features are hidden from non-admin users.
              </p>
              <p>
                <strong>Beta</strong> features are marked with a purple badge and are under active development.
                They can be toggled independently of the enabled state.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
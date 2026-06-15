'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { api, useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FileText, ArrowLeft, Search, Download, Camera,
  FileSpreadsheet, ScrollText, FolderOpen, Filter,
} from 'lucide-react'

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  drawing: { label: 'Drawings', icon: FileSpreadsheet, color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40' },
  contract: { label: 'Contracts', icon: ScrollText, color: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/40' },
  report: { label: 'Reports', icon: FileText, color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40' },
  photo: { label: 'Photos', icon: Camera, color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40' },
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function ClientDocuments() {
  const { navigate } = useAppStore()
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>('')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [activeTab, setActiveTab] = React.useState('all')
  const [hasInitialized, setHasInitialized] = React.useState(false)

  // Fetch projects
  const { data: projectsData } = useQuery({
    queryKey: ['client-portal-projects-docs'],
    queryFn: () => api.get('/api/client-portal/projects'),
  })
  const projects = projectsData?.data || []

  React.useEffect(() => {
    if (!hasInitialized && projects.length > 0) {
      setSelectedProjectId(projects[0].id)
      setHasInitialized(true)
    }
  }, [projects, hasInitialized])

  // Fetch documents
  const { data, isLoading } = useQuery({
    queryKey: ['client-portal-documents', selectedProjectId],
    queryFn: () => api.get(`/api/client-portal/projects/${selectedProjectId}/documents`),
    enabled: !!selectedProjectId,
  })

  const documents = data?.data?.documents || []
  const counts = data?.data?.counts || {}

  // Filter
  const filtered = documents.filter((doc: any) => {
    if (activeTab !== 'all' && doc.type !== activeTab) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return doc.name.toLowerCase().includes(q)
    }
    return true
  })

  // Group by type
  const grouped: Record<string, typeof documents> = {}
  for (const doc of filtered) {
    if (!grouped[doc.type]) grouped[doc.type] = []
    grouped[doc.type].push(doc)
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button size="icon" variant="ghost" onClick={() => navigate('client-dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Browse project drawings, contracts, and reports</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="sm:w-64">
                <SelectValue placeholder="Select project..." />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>{p.name} ({p.code})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {!selectedProjectId ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FolderOpen className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">Select a project to view documents</p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-80" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        </div>
      ) : documents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FolderOpen className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">No documents found for this project</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Type Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex-wrap">
              <TabsTrigger value="all" className="gap-1.5">
                <Filter className="h-3.5 w-3.5" /> All ({documents.length})
              </TabsTrigger>
              {Object.entries(typeConfig).map(([type, config]) => (
                <TabsTrigger key={type} value={type} className="gap-1.5">
                  <config.icon className="h-3.5 w-3.5" />
                  {config.label} ({counts[type] || 0})
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {activeTab === 'all' ? (
                // Grouped view
                <div className="space-y-6">
                  {Object.entries(grouped).map(([type, docs]) => {
                    const config = typeConfig[type] || typeConfig.other
                    return (
                      <div key={type}>
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${config.color}`}>
                            <config.icon className="h-4 w-4" />
                          </div>
                          <h3 className="font-semibold text-sm">{config.label}</h3>
                          <Badge variant="secondary" className="text-xs">{docs.length}</Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {docs.map((doc: any) => (
                            <DocumentCard key={doc.id} doc={doc} config={config} />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                // Single type view
                filtered.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Search className="h-8 w-8 text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">No documents match your search</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filtered.map((doc: any) => (
                      <DocumentCard
                        key={doc.id}
                        doc={doc}
                        config={typeConfig[doc.type] || typeConfig.other}
                      />
                    ))}
                  </div>
                )
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}

function DocumentCard({ doc, config }: { doc: any; config: { icon: React.ElementType; color: string } }) {
  const Icon = config.icon
  return (
    <Card className="hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors group">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
              {doc.name}
            </p>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
              {doc.fileSize && <span>· {formatFileSize(doc.fileSize)}</span>}
            </div>
            {doc.mimeType && (
              <Badge variant="secondary" className="text-[10px] mt-1.5 px-1.5 py-0">
                {doc.mimeType.split('/').pop()?.toUpperCase()}
              </Badge>
            )}
          </div>
          <Button size="icon" variant="ghost" className="h-8 w-8 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { GripVertical, Eye, EyeOff, Settings2, Save, RotateCcw, Plus, ChevronDown, ChevronUp, Trash2, Eye as ViewIcon } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface Section {
  id: string; type: string; name: string; order: number; visible: boolean; config: any
}

const SECTION_TYPES = [
  'header', 'hero', 'trusted-by', 'platform-overview', 'features',
  'industries', 'enterprise-modules', 'workflow', 'ai-features',
  'screenshots', 'testimonials', 'case-studies', 'statistics',
  'pricing', 'faq', 'news', 'blog', 'partners', 'cta', 'footer',
]

const SECTION_LABELS: Record<string, string> = {
  'header': 'Floating Header', 'hero': 'Hero Section', 'trusted-by': 'Trusted By',
  'platform-overview': 'Platform Overview', 'features': 'Core Features', 'industries': 'Industries',
  'enterprise-modules': 'Enterprise Modules', 'workflow': 'Workflow Showcase', 'ai-features': 'AI Features',
  'screenshots': 'Screenshots', 'testimonials': 'Testimonials', 'case-studies': 'Case Studies',
  'statistics': 'Statistics', 'pricing': 'Pricing', 'faq': 'FAQ', 'news': 'Latest News',
  'blog': 'Blog', 'partners': 'Partners', 'cta': 'Call To Action', 'footer': 'Footer',
}

const SECTION_DESCRIPTIONS: Record<string, string> = {
  'header': 'Transparent glass navigation with logo, links, and CTAs.',
  'hero': 'Main hero with headline, subheadline, CTAs, and stats.',
  'trusted-by': 'Auto-scrolling partner/client logo carousel.',
  'platform-overview': '4-card overview of platform capabilities.',
  'features': '16 module cards in a responsive grid.',
  'industries': '12 industry solution cards.',
  'enterprise-modules': '6 enterprise-grade module cards with gold accent.',
  'workflow': '7-step animated workflow showcase.',
  'ai-features': '6 AI feature cards with glow effect.',
  'screenshots': 'Interactive platform screenshot carousel.',
  'testimonials': 'Customer testimonial cards with ratings.',
  'case-studies': 'Case study cards with results metrics.',
  'statistics': 'Animated counter statistics section.',
  'pricing': '5 pricing plan cards with monthly/annual toggle.',
  'faq': 'Searchable FAQ accordion.',
  'news': 'Latest news cards section.',
  'blog': 'Blog post preview cards.',
  'partners': 'Partner/client logo grid.',
  'cta': 'Full-width call to action with navy gradient.',
  'footer': 'Multi-column professional footer.',
}

export default function PageBuilder() {
  const [sections, setSections] = useState<Section[]>([])
  const [editing, setEditing] = useState<Section | null>(null)
  const [saving, setSaving] = useState(false)
  const [editConfig, setEditConfig] = useState<any>({})
  const [pageId, setPageId] = useState<string>('')

  useEffect(() => {
    fetch('/api/cms/landing').then(r => r.json()).then(data => {
      if (data.page) {
        setPageId(data.page.id)
        setSections(data.page.sections || [])
      }
    })
  }, [])

  const toggleVisibility = async (section: Section) => {
    try {
      const res = await fetch(`/api/cms/sections/${section.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visible: !section.visible }),
      })
      if (res.ok) {
        setSections(s => s.map(sec => sec.id === section.id ? { ...sec, visible: !sec.visible } : sec))
        toast.success(`${section.name} ${!section.visible ? 'shown' : 'hidden'}`)
      }
    } catch { toast.error('Failed to update') }
  }

  const deleteSection = async (section: Section) => {
    if (!confirm(`Delete "${section.name}"?`)) return
    try {
      const res = await fetch(`/api/cms/sections/${section.id}`, { method: 'DELETE' })
      if (res.ok) {
        setSections(s => s.filter(sec => sec.id !== section.id))
        toast.success(`Deleted ${section.name}`)
      }
    } catch { toast.error('Failed to delete') }
  }

  const moveSection = async (section: Section, direction: 'up' | 'down') => {
    const idx = sections.findIndex(s => s.id === section.id)
    if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === sections.length - 1)) return
    const newSections = [...sections]
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    ;[newSections[idx], newSections[swapIdx]] = [newSections[swapIdx], newSections[idx]]
    setSections(newSections)
    try {
      await Promise.all(newSections.map((s, i) =>
        fetch(`/api/cms/sections/${s.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: i }),
        })
      ))
      toast.success('Section reordered')
    } catch { toast.error('Failed to reorder') }
  }

  const saveSection = async () => {
    if (!editing) return
    setSaving(true)
    try {
      const res = await fetch(`/api/cms/sections/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: editConfig, name: editConfig._name || editing.name }),
      })
      if (res.ok) {
        setSections(s => s.map(sec => sec.id === editing.id ? { ...sec, config: editConfig, name: editConfig._name || sec.name } : sec))
        toast.success('Section saved')
        setEditing(null)
      } else toast.error('Save failed')
    } catch { toast.error('Save failed') }
    setSaving(false)
  }

  const addSection = async (type: string) => {
    if (!pageId) return
    try {
      const res = await fetch('/api/cms/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId, type, name: SECTION_LABELS[type] || type, order: sections.length }),
      })
      if (res.ok) {
        const newSec = await res.json()
        setSections(s => [...s, newSec])
        toast.success(`Added ${SECTION_LABELS[type]}`)
      }
    } catch { toast.error('Failed to add section') }
  }

  const configToFormFields = (config: any, type: string) => {
    if (!config) return []
    const entries = Object.entries(config).filter(([k]) => k !== '_name' && typeof config[k] !== 'object')
    if (type === 'hero') return [
      { key: 'badge', label: 'Badge Text', type: 'text' },
      { key: 'headline', label: 'Headline', type: 'text' },
      { key: 'subheadline', label: 'Subheadline', type: 'textarea' },
    ]
    if (type === 'cta') return [
      { key: 'headline', label: 'Headline', type: 'text' },
      { key: 'subheadline', label: 'Subheadline', type: 'textarea' },
    ]
    if (type === 'footer') return [
      { key: 'tagline', label: 'Tagline', type: 'text' },
      { key: 'address', label: 'Address', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'copyright', label: 'Copyright', type: 'text' },
    ]
    return entries.map(([key, value]) => ({ key, label: key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()), type: typeof value === 'string' && value.length > 100 ? 'textarea' : 'text' }))
  }

  const formFields = editing ? configToFormFields(editing.config, editing.type) : []

  const handleEditOpen = (section: Section, open: boolean) => {
    if (!open) { setEditing(null); return }
    setEditing(section)
    setEditConfig({ ...section.config, _name: section.name })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Visual Page Builder</h1>
          <p className="text-muted-foreground mt-1">Manage landing page sections. Drag, reorder, toggle visibility, and edit content.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/" target="_blank">
            <Button variant="outline" size="sm"><ViewIcon className="w-4 h-4 mr-2" /> Preview Site</Button>
          </Link>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-[#F5A623] hover:bg-[#e6961a] text-[#0B2345]"><Plus className="w-4 h-4 mr-2" /> Add Section</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Add New Section</DialogTitle></DialogHeader>
              <div className="grid gap-2 mt-4">
                {SECTION_TYPES.filter(t => !sections.find(s => s.type === t)).map(type => (
                  <button key={type} onClick={() => addSection(type)} className="text-left p-3 rounded-lg border hover:bg-muted transition-colors">
                    <div className="font-medium text-sm">{SECTION_LABELS[type]}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{SECTION_DESCRIPTIONS[type]}</div>
                  </button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-2">
        {sections.sort((a, b) => a.order - b.order).map((section, idx) => (
          <Card key={section.id} className={`${!section.visible ? 'opacity-50' : ''} transition-opacity`}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex flex-col gap-1">
                <button onClick={() => moveSection(section, 'up')} disabled={idx === 0} className="p-0.5 hover:bg-muted rounded disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
                <button onClick={() => moveSection(section, 'down')} disabled={idx === sections.length - 1} className="p-0.5 hover:bg-muted rounded disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
              </div>
              <GripVertical className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{section.name}</div>
                <div className="text-xs text-muted-foreground">{section.type} · Order: {section.order}</div>
              </div>
              <Badge variant="outline" className="text-xs">{section.type}</Badge>
              <Switch checked={section.visible} onCheckedChange={() => toggleVisibility(section)} />
              <Dialog open={editing?.id === section.id} onOpenChange={(open) => handleEditOpen(section, open)}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm"><Settings2 className="w-4 h-4" /></Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>Edit: {section.name}</DialogTitle></DialogHeader>
                  <div className="space-y-4 mt-4">
                    {formFields.map(field => (
                      <div key={field.key} className="space-y-1.5">
                        <Label className="text-sm">{field.label}</Label>
                        {field.type === 'textarea' ? (
                          <Textarea value={editConfig[field.key] || ''} onChange={e => setEditConfig(c => ({ ...c, [field.key]: e.target.value }))} rows={3} />
                        ) : (
                          <Input value={editConfig[field.key] || ''} onChange={e => setEditConfig(c => ({ ...c, [field.key]: e.target.value }))} />
                        )}
                      </div>
                    ))}
                    <Button onClick={saveSection} disabled={saving} className="w-full bg-[#F5A623] hover:bg-[#e6961a] text-[#0B2345]">
                      <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => deleteSection(section)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {sections.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Settings2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No sections yet. Click &quot;Add Section&quot; to start building.</p>
          </div>
        )}
      </div>
    </div>
  )
}

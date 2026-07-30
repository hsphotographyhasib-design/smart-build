'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Star } from 'lucide-react'
import { toast } from 'sonner'

interface FieldConfig { key: string; label: string; type: 'text' | 'textarea' | 'number' | 'rating' }

interface GenericCrudProps {
  title: string; description: string; apiPath: string; fields: FieldConfig[]; itemName: string
  statusField?: string; publishedStatus?: string; featuredField?: string
}

export function GenericCrud({ title, description, apiPath, fields, itemName, statusField = 'status', publishedStatus = 'published', featuredField }: GenericCrudProps) {
  const [items, setItems] = useState<any[]>([])
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const load = useCallback(async () => {
    try { const res = await fetch(apiPath); if (res.ok) setItems(await res.json()) } catch {}
  }, [apiPath])

  useEffect(() => { load() }, [load])

  const openCreate = () => {
    const defaults: any = {}
    fields.forEach(f => { defaults[f.key] = f.type === 'number' ? 0 : '' })
    setForm(defaults); setIsCreating(true); setEditing(null)
  }

  const openEdit = (item: any) => { setForm({ ...item }); setEditing(item); setIsCreating(false) }

  const save = async () => {
    setSaving(true)
    try {
      const url = isCreating ? apiPath : `${apiPath}/${editing.id}`
      const method = isCreating ? 'POST' : 'PUT'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) { toast.success(isCreating ? `${itemName} created` : `${itemName} updated`); setEditing(null); setIsCreating(false); load() } else toast.error('Failed')
    } catch { toast.error('Failed') }
    setSaving(false)
  }

  const remove = async (id: string) => {
    if (!confirm(`Delete this ${itemName.toLowerCase()}?`)) return
    try { const res = await fetch(`${apiPath}/${id}`, { method: 'DELETE' }); if (res.ok) { toast.success('Deleted'); load() } else toast.error('Failed') } catch { toast.error('Failed') }
  }

  const handleCreateOpen = (open: boolean) => {
    if (!open) { setIsCreating(false); return }
    openCreate()
  }

  const handleEditOpen = (open: boolean) => {
    if (!open) { setEditing(null); return }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold font-heading">{title}</h1><p className="text-muted-foreground mt-1">{description}</p></div>
        <Dialog open={isCreating} onOpenChange={handleCreateOpen}>
          <DialogTrigger asChild><Button className="bg-[#F5A623] hover:bg-[#e6961a] text-[#0B2345]"><Plus className="w-4 h-4 mr-2" />Add {itemName}</Button></DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Add {itemName}</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              {fields.map(f => (
                <div key={f.key} className="space-y-1.5">
                  <Label>{f.label}</Label>
                  {f.type === 'textarea' ? <Textarea value={form[f.key] || ''} onChange={e => setForm(fo => ({ ...fo, [f.key]: e.target.value }))} rows={3} /> :
                  f.type === 'rating' ? <div className="flex gap-1">{[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setForm(fo => ({ ...fo, [f.key]: n }))} className={`p-1 ${form[f.key] >= n ? 'text-[#F5A623]' : 'text-muted-foreground/30'}`}><Star className="w-5 h-5" fill={form[f.key] >= n ? 'currentColor' : 'none'} /></button>
                  ))}</div> :
                  <Input type={f.type} value={form[f.key] ?? ''} onChange={e => setForm(fo => ({ ...fo, [f.key]: f.type === 'number' ? (parseFloat(e.target.value) || 0) : e.target.value }))} />}
                </div>
              ))}
              <Button onClick={save} disabled={saving} className="w-full bg-[#F5A623] hover:bg-[#e6961a] text-[#0B2345]">{saving ? 'Saving...' : `Create ${itemName}`}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-2">
        {items.map(item => (
          <Card key={item.id}><CardContent className="p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{item.name || item.title || item.question || item.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{item.company && `${item.company} · `}{item.position && `${item.position} · `}{item.category && `${item.category} · `}{item[statusField]}</div>
            </div>
            {featuredField && item[featuredField] && <Badge variant="outline" className="text-[#F5A623] border-[#F5A623]/30">Featured</Badge>}
            <Badge variant={item[statusField] === publishedStatus ? 'default' : 'secondary'}>{item[statusField]}</Badge>
            <Button variant="ghost" size="sm" onClick={() => openEdit(item)}><Edit className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => remove(item.id)}><Trash2 className="w-4 h-4" /></Button>
          </CardContent></Card>
        ))}
        {items.length === 0 && <div className="text-center py-12 text-muted-foreground">No {itemName.toLowerCase()}s yet.</div>}
      </div>
      <Dialog open={!!editing && !isCreating} onOpenChange={handleEditOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit {itemName}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            {fields.map(f => (
              <div key={f.key} className="space-y-1.5">
                <Label>{f.label}</Label>
                {f.type === 'textarea' ? <Textarea value={form[f.key] || ''} onChange={e => setForm(fo => ({ ...fo, [f.key]: e.target.value }))} rows={3} /> :
                f.type === 'rating' ? <div className="flex gap-1">{[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setForm(fo => ({ ...fo, [f.key]: n }))} className={`p-1 ${form[f.key] >= n ? 'text-[#F5A623]' : 'text-muted-foreground/30'}`}><Star className="w-5 h-5" fill={form[f.key] >= n ? 'currentColor' : 'none'} /></button>
                ))}</div> :
                <Input type={f.type} value={form[f.key] ?? ''} onChange={e => setForm(fo => ({ ...fo, [f.key]: f.type === 'number' ? (parseFloat(e.target.value) || 0) : e.target.value }))} />}
              </div>
            ))}
            <Button onClick={save} disabled={saving} className="w-full bg-[#F5A623] hover:bg-[#e6961a] text-[#0B2345]">{saving ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
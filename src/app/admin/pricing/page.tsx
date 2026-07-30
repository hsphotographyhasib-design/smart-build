'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Edit, Check } from 'lucide-react'
import { toast } from 'sonner'

interface Plan {
  id: string; name: string; description: string | null; priceMonthly: number; priceAnnual: number;
  maxUsers: number; maxProjects: number; maxStorage: number; features: string; sortOrder: number; active: boolean;
}

export default function PricingManager() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [editing, setEditing] = useState<Plan | null>(null)
  const [form, setForm] = useState<any>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetch('/api/cms/landing').then(r => r.json()).then(d => setPlans(d.plans || [])) }, [])

  const openEdit = (plan: Plan) => {
    setEditing(plan)
    const features: string[] = typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features || []
    setForm({ ...plan, featuresStr: features.join('\n') })
  }

  const save = async () => {
    setSaving(true)
    try {
      const features = (form.featuresStr || '').split('\n').filter(Boolean)
      const payload = { ...form, features: JSON.stringify(features) }
      delete payload.featuresStr
      const res = await fetch(`/api/platform/plans/${form.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (res.ok) { toast.success('Plan updated'); setEditing(null) } else toast.error('Failed')
    } catch { toast.error('Failed') }
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold font-heading">Pricing Manager</h1><p className="text-muted-foreground mt-1">Manage subscription plans and pricing.</p></div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.sort((a, b) => a.sortOrder - b.sortOrder).map(plan => {
          const features: string[] = typeof plan.features === 'string' ? JSON.parse(plan.features) : []
          return (
            <Card key={plan.id} className={!plan.active ? 'opacity-50' : ''}>
              <CardHeader className="pb-2"><CardTitle className="text-lg flex items-center justify-between">{plan.name}<Badge variant={plan.active ? 'default' : 'secondary'}>{plan.active ? 'Active' : 'Inactive'}</Badge></CardTitle></CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${plan.priceMonthly}<span className="text-sm text-muted-foreground font-normal">/mo</span></div>
                <p className="text-sm text-muted-foreground mt-1 mb-3">{plan.description}</p>
                <ul className="space-y-1 mb-4">{features.slice(0, 4).map((f, i) => <li key={i} className="text-xs flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-500" />{f}</li>)}
                {features.length > 4 && <li className="text-xs text-muted-foreground">+{features.length - 4} more</li>}</ul>
                <div className="flex gap-2 text-xs text-muted-foreground">{plan.maxUsers > 0 ? <span>{plan.maxUsers} users</span> : <span>Unlimited</span>}<span>·</span>{plan.maxStorage > 1000 ? `${plan.maxStorage / 1000}GB` : `${plan.maxStorage}MB`}</div>
                <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => openEdit(plan)}><Edit className="w-3.5 h-3.5 mr-2" />Edit</Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
      <Dialog open={!!editing} onOpenChange={open => { if (!open) setEditing(null) }}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit: {editing?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Name</Label><Input value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Monthly Price</Label><Input type="number" value={form.priceMonthly ?? 0} onChange={e => setForm(f => ({ ...f, priceMonthly: parseFloat(e.target.value) }))} /></div>
              <div className="space-y-1.5"><Label>Annual Price</Label><Input type="number" value={form.priceAnnual ?? 0} onChange={e => setForm(f => ({ ...f, priceAnnual: parseFloat(e.target.value) }))} /></div>
              <div className="space-y-1.5"><Label>Max Users</Label><Input type="number" value={form.maxUsers ?? 5} onChange={e => setForm(f => ({ ...f, maxUsers: parseInt(e.target.value) }))} /></div>
              <div className="space-y-1.5"><Label>Max Projects</Label><Input type="number" value={form.maxProjects ?? 3} onChange={e => setForm(f => ({ ...f, maxProjects: parseInt(e.target.value) }))} /></div>
              <div className="space-y-1.5"><Label>Storage (MB)</Label><Input type="number" value={form.maxStorage ?? 500} onChange={e => setForm(f => ({ ...f, maxStorage: parseInt(e.target.value) }))} /></div>
            </div>
            <div className="space-y-1.5"><Label>Description</Label><Input value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Features (one per line)</Label></div>
            <textarea className="w-full min-h-[120px] rounded-md border bg-background px-3 py-2 text-sm font-mono" value={form.featuresStr || ''} onChange={e => setForm(f => ({ ...f, featuresStr: e.target.value }))} />
            <Button onClick={save} disabled={saving} className="w-full bg-[#F5A623] hover:bg-[#e6961a] text-[#0B2345]">{saving ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

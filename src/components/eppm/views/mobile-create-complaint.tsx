'use client'

// Mobile Create Complaint — the intake form from the HJSB mobile reference:
// category, sub-category, priority segmented control, location, description,
// photo upload, submit. Feeds the maintenance workflow (toast + route on submit).
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Plus, MapPin, Send, ChevronDown, X, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { View } from '@/lib/eppm'
import type { WfPriority } from '@/lib/maintenance-workflow'
import { useWorkflow } from '@/components/eppm/workflow/workflow-context'
import { useAuth } from '@/components/auth/auth-context'

const CATEGORIES: Record<string, string[]> = {
  Electrical: ['Lighting', 'Power Outlet', 'Distribution Board', 'Generator'],
  HVAC: ['Air Conditioning', 'Ventilation', 'Chiller', 'Cooling Tower'],
  Plumbing: ['Leakage', 'Blockage', 'Water Supply', 'Sanitary'],
  Civil: ['Cracks', 'Flooring', 'Roofing', 'Painting'],
  'Fire Protection': ['Sprinkler', 'Fire Alarm', 'Extinguisher', 'Hydrant'],
  Lifts: ['Door Fault', 'Levelling', 'Button Panel', 'Emergency Phone'],
}
const PRIORITIES = ['Low', 'Medium', 'High', 'Emergency'] as const

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}

export default function MobileCreateComplaint({ onNavigate }: { onNavigate: (v: View) => void }) {
  const { createComplaint } = useWorkflow()
  const { user } = useAuth()
  const [category, setCategory] = useState('Electrical')
  const [sub, setSub] = useState('Lighting')
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]>('Medium')
  const [location, setLocation] = useState('')
  const [desc, setDesc] = useState('')
  const [photos, setPhotos] = useState<number[]>([])

  const submit = () => {
    if (!location.trim() || !desc.trim()) {
      toast.error('Please add a location and description.')
      return
    }
    // Real intake — the case enters the engine (NEW → SUBMITTED + validation)
    const id = createComplaint({
      title: `${sub} — ${category}`,
      desc,
      customer: user?.name ?? 'Customer Portal',
      site: location.trim(),
      trade: category,
      priority: priority as WfPriority,
      photos: photos.length,
    })
    toast.success(`Complaint ${id} submitted`, { description: 'Validated and routed to the maintenance supervisor.' })
    onNavigate('work-orders')
  }

  const selectCls = 'flex w-full items-center justify-between rounded-xl border border-border bg-card px-3.5 py-3 text-sm'

  return (
    <div className="space-y-5 pb-4">
      <h1 className="text-fluid-title font-extrabold tracking-tight">Create Complaint</h1>

      <div className="space-y-4">
        <Field label="Category">
          <div className="relative">
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setSub(CATEGORIES[e.target.value][0]) }}
              className={cn(selectCls, 'appearance-none pr-9')}
            >
              {Object.keys(CATEGORIES).map((c) => <option key={c}>{c}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </Field>

        <Field label="Sub Category">
          <div className="relative">
            <select value={sub} onChange={(e) => setSub(e.target.value)} className={cn(selectCls, 'appearance-none pr-9')}>
              {CATEGORIES[category].map((s) => <option key={s}>{s}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </Field>

        <Field label="Priority">
          <div className="grid grid-cols-4 gap-1.5 rounded-xl bg-muted p-1">
            {PRIORITIES.map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={cn(
                  'rounded-lg py-2 text-xs font-bold transition-colors sm:text-sm',
                  priority === p
                    ? p === 'Emergency' ? 'bg-rose-600 text-white' : p === 'High' ? 'bg-rose-500 text-white' : p === 'Medium' ? 'bg-amber-500 text-white' : 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground',
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Location">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Block B · Level 2 · Office 205"
              className="w-full rounded-xl border border-border bg-card py-3 pl-9 pr-3.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </Field>

        <Field label="Description">
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={3}
            placeholder="Describe the issue in detail…"
            className="w-full resize-none rounded-xl border border-border bg-card p-3.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          />
        </Field>

        <Field label="Upload Photos">
          <div className="flex flex-wrap gap-2.5">
            {photos.map((id) => (
              <motion.div key={id} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="relative grid h-20 w-20 place-items-center rounded-xl border border-border bg-muted">
                <Camera className="h-6 w-6 text-muted-foreground/50" />
                <button onClick={() => setPhotos((p) => p.filter((x) => x !== id))} className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-rose-500 text-white">
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            ))}
            <button
              onClick={() => setPhotos((p) => [...p, Date.now()])}
              className="grid h-20 w-20 place-items-center rounded-xl border-2 border-dashed border-border text-muted-foreground active:scale-95"
            >
              <Plus className="h-6 w-6" />
            </button>
          </div>
          {photos.length > 0 && (
            <p className="mt-2 flex items-center gap-1 text-[11px] text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" />{photos.length} photo{photos.length > 1 ? 's' : ''} attached</p>
          )}
        </Field>
      </div>

      <button
        onClick={submit}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 active:scale-[0.98] transition-transform"
      >
        <Send className="h-4 w-4" /> Submit Complaint
      </button>
    </div>
  )
}

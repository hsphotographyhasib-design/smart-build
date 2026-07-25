import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import {
  Building2, Wrench, ClipboardList, HardHat, Boxes, ShoppingCart,
  ReceiptText, Users, BarChart3, QrCode,
} from 'lucide-react'

export type ModuleKey =
  | 'projects' | 'maintenance' | 'tasks' | 'work-orders'
  | 'inventory' | 'procurement' | 'finance' | 'hr' | 'reports' | 'qr-assets'

const MODULE_CONFIG: Record<ModuleKey, { icon: LucideIcon; label: string; darkBg: boolean }> = {
  projects:    { icon: Building2,    label: 'Projects',    darkBg: true },
  maintenance: { icon: Wrench,        label: 'Maintenance', darkBg: true },
  tasks:       { icon: ClipboardList, label: 'Tasks',       darkBg: false },
  'work-orders': { icon: HardHat,    label: 'Work Orders', darkBg: false },
  inventory:   { icon: Boxes,         label: 'Inventory',   darkBg: true },
  procurement: { icon: ShoppingCart,  label: 'Procurement', darkBg: false },
  finance:     { icon: ReceiptText,   label: 'Finance',     darkBg: false },
  hr:          { icon: Users,         label: 'HR',          darkBg: false },
  reports:     { icon: BarChart3,     label: 'Reports',     darkBg: false },
  'qr-assets': { icon: QrCode,        label: 'QR Assets',   darkBg: false },
}

interface ModuleIconProps {
  module: ModuleKey
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
  active?: boolean
}

export function ModuleIcon({ module, size = 'md', showLabel = false, className, active }: ModuleIconProps) {
  const config = MODULE_CONFIG[module]
  const Icon = config.icon
  const sizeMap = { sm: 'h-8 w-8', md: 'h-11 w-11', lg: 'h-14 w-14' }
  const iconSizeMap = { sm: 'h-4 w-4', md: 'h-5.5 w-5.5', lg: 'h-7 w-7' }

  return (
    <div className={cn('flex flex-col items-center gap-1.5', className)}>
      <div
        className={cn(
          'grid place-items-center rounded-[22%] shadow-sm transition-all',
          sizeMap[size],
          config.darkBg
            ? 'bg-[#0B2345] text-white'
            : 'bg-white text-[#0B2345] border border-[#0B2345]/15',
          active && 'ring-2 ring-[#F5A623] ring-offset-2',
        )}
      >
        <Icon className={iconSizeMap[size]} />
      </div>
      {showLabel && (
        <span className={cn('text-[10px] font-bold uppercase tracking-wide text-[#0B2345]')}>
          {config.label}
        </span>
      )}
    </div>
  )
}

export function getModuleIcon(module: ModuleKey): LucideIcon {
  return MODULE_CONFIG[module].icon
}

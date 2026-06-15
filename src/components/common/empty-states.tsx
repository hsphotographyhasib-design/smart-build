'use client'

import {
  LucideIcon,
  Plus,
  Inbox,
  Search,
  FileText,
  Users,
  AlertTriangle,
  Package,
  ClipboardList,
  BarChart3,
  Settings,
  Bell,
  Building2,
  CalendarDays,
  Briefcase,
  Wrench,
  DollarSign,
  FolderKanban,
  LayoutDashboard,
  Shield,
  Truck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

/* -------------------------------------------------------------------------- */
/*  Generic Empty State                                                       */
/* -------------------------------------------------------------------------- */

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  variant?: 'default' | 'search' | 'error'
  children?: React.ReactNode
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = 'default',
  children,
}: EmptyStateProps) {
  const variantConfig = {
    default: {
      icon: Icon ?? Inbox,
      ringColor: 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500',
    },
    search: {
      icon: Icon ?? Search,
      ringColor: 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500',
    },
    error: {
      icon: Icon ?? AlertTriangle,
      ringColor: 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500',
    },
  }

  const { icon: ResolvedIcon, ringColor } = variantConfig[variant]

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-8 sm:p-12">
      <div className={`flex size-12 items-center justify-center rounded-full ${ringColor}`}>
        <ResolvedIcon className="size-6" />
      </div>
      <div className="mt-4 max-w-sm text-center">
        <p className="font-medium text-gray-900 dark:text-gray-100">{title}</p>
        {description && (
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-4" size="sm">
          <Plus className="size-4" />
          {actionLabel}
        </Button>
      )}
      {children}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Empty Projects                                                            */
/* -------------------------------------------------------------------------- */

export function EmptyProjects({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={FolderKanban}
      title="No projects yet"
      description="Get started by creating your first project to organize work and track progress."
      actionLabel="Create Project"
      onAction={onAdd}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*  Empty Tickets                                                             */
/* -------------------------------------------------------------------------- */

export function EmptyTickets({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={ClipboardList}
      title="No tickets found"
      description="There are no tickets to display. Create a new ticket to get started."
      actionLabel="New Ticket"
      onAction={onAdd}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*  Empty Technicians                                                         */
/* -------------------------------------------------------------------------- */

export function EmptyTechnicians({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={Wrench}
      title="No technicians added"
      description="Add technicians to your team so they can be assigned to work orders and service requests."
      actionLabel="Add Technician"
      onAction={onAdd}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*  Empty Assets                                                              */
/* -------------------------------------------------------------------------- */

export function EmptyAssets({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={Package}
      title="No assets registered"
      description="Register your first asset to start tracking equipment, machinery, and other resources."
      actionLabel="Add Asset"
      onAction={onAdd}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*  Empty Reports                                                             */
/* -------------------------------------------------------------------------- */

export function EmptyReports({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={BarChart3}
      title="No reports available"
      description="Reports will appear here once there is enough data to generate insights."
      actionLabel={onAdd ? 'Generate Report' : undefined}
      onAction={onAdd}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*  Empty Notifications                                                       */
/* -------------------------------------------------------------------------- */

export function EmptyNotifications() {
  return (
    <EmptyState
      icon={Bell}
      title="No notifications"
      description="You're all caught up. New notifications will appear here."
    />
  )
}

/* -------------------------------------------------------------------------- */
/*  Empty Search Results                                                      */
/* -------------------------------------------------------------------------- */

export function EmptySearchResults() {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description="Try adjusting your search query or filters to find what you're looking for."
      variant="search"
    />
  )
}

/* -------------------------------------------------------------------------- */
/*  Empty Comments                                                            */
/* -------------------------------------------------------------------------- */

export function EmptyComments() {
  return (
    <EmptyState
      icon={CalendarDays}
      title="No comments yet"
      description="Be the first to leave a comment on this item."
    />
  )
}

/* -------------------------------------------------------------------------- */
/*  Empty Documents                                                           */
/* -------------------------------------------------------------------------- */

export function EmptyDocuments({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={FileText}
      title="No documents uploaded"
      description="Upload your first document to keep all your files organized in one place."
      actionLabel="Upload Document"
      onAction={onAdd}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*  Empty Invoices                                                            */
/* -------------------------------------------------------------------------- */

export function EmptyInvoices({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={DollarSign}
      title="No invoices"
      description="Create an invoice to start billing your clients for work completed."
      actionLabel="Create Invoice"
      onAction={onAdd}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*  Empty Employees                                                           */
/* -------------------------------------------------------------------------- */

export function EmptyEmployees({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={Users}
      title="No employees added"
      description="Add employees to manage your workforce and assign roles and permissions."
      actionLabel="Add Employee"
      onAction={onAdd}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*  Empty Data (generic)                                                      */
/* -------------------------------------------------------------------------- */

export function EmptyData({
  title = 'No data available',
  description = 'Data will appear here once it becomes available.',
}: {
  title?: string
  description?: string
}) {
  return (
    <EmptyState
      icon={LayoutDashboard}
      title={title}
      description={description}
    />
  )
}
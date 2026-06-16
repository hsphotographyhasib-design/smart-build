import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

interface SearchResultItem {
  id: string
  title: string
  subtitle: string
  status: string
  category: string
  href: string
}

interface CategoryResult {
  total: number
  items: SearchResultItem[]
}

const ALL_CATEGORIES = [
  'project',
  'complaint',
  'work_order',
  'customer',
  'invoice',
  'payment',
  'purchase_order',
  'purchase_request',
  'supplier',
  'stock',
  'employee',
  'asset',
  'attendance',
  'task',
  'user',
  'audit_log',
] as const

type CategoryKey = (typeof ALL_CATEGORIES)[number]

function searchWhere(fields: string[], query: string) {
  const orConditions = fields.map((field) => ({
    [field]: { contains: query },
  }))
  return { OR: orConditions }
}

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim()
    if (!query) {
      return NextResponse.json({ success: false, error: 'Query parameter "q" is required' }, { status: 400 })
    }

    const category = searchParams.get('category')
    const limitParam = parseInt(searchParams.get('limit') || '20', 10)
    const offsetParam = parseInt(searchParams.get('offset') || '0', 10)
    const limit = Math.min(Math.max(limitParam, 1), 50)
    const offset = Math.max(offsetParam, 0)

    const role = user.role
    const isClient = role === 'client'
    const isLabour = role === 'labour'
    const isAdmin = role === 'admin' || role === 'super_admin'
    const isAccountant = role === 'accountant'
    const isStoreManager = role === 'store_manager'
    const isAuditor = role === 'auditor'

    // Determine which categories to search
    const categoriesToSearch: CategoryKey[] = category
      ? [category as CategoryKey].filter((c) => ALL_CATEGORIES.includes(c as CategoryKey)) as CategoryKey[]
      : [...ALL_CATEGORIES]

    // Build search promises
    const searchPromises: Promise<{ key: CategoryKey; results: SearchResultItem[] }>[] = []

    if (categoriesToSearch.includes('project')) {
      searchPromises.push(
        db.project
          .findMany({
            where: searchWhere(['name', 'code', 'description'], query),
            select: { id: true, name: true, code: true, status: true },
            take: limit,
            skip: offset,
            orderBy: { updatedAt: 'desc' },
          })
          .then((items) => ({
            key: 'project' as CategoryKey,
            results: items.map((p) => ({
              id: p.id,
              title: p.name,
              subtitle: p.code,
              status: p.status,
              category: 'project',
              href: `project-detail?id=${p.id}`,
            })),
          }))
      )
    }

    if (categoriesToSearch.includes('complaint')) {
      const complaintWhere = {
        AND: [
          searchWhere(['subject', 'description'], query),
          ...(isClient ? [{ createdById: user.id }] : []),
        ],
      }
      searchPromises.push(
        db.clientComplaint
          .findMany({
            where: complaintWhere,
            select: { id: true, subject: true, severity: true, status: true, createdById: true },
            take: limit,
            skip: offset,
            orderBy: { createdAt: 'desc' },
          })
          .then((items) => ({
            key: 'complaint' as CategoryKey,
            results: items.map((c) => ({
              id: c.id,
              title: c.subject,
              subtitle: c.severity,
              status: c.status,
              category: 'complaint',
              href: `project-detail?id=${c.projectId}`,
            })),
          }))
      )
    }

    if (categoriesToSearch.includes('work_order') && !isLabour) {
      searchPromises.push(
        db.workOrder
          .findMany({
            where: searchWhere(['orderNo', 'description'], query),
            select: { id: true, orderNo: true, description: true, status: true, projectId: true },
            take: limit,
            skip: offset,
            orderBy: { createdAt: 'desc' },
          })
          .then((items) => ({
            key: 'work_order' as CategoryKey,
            results: items.map((w) => ({
              id: w.id,
              title: w.orderNo,
              subtitle: w.description?.substring(0, 80) || '',
              status: w.status,
              category: 'work_order',
              href: `project-detail?id=${w.projectId}`,
            })),
          }))
      )
    }

    if (categoriesToSearch.includes('customer')) {
      searchPromises.push(
        db.customer
          .findMany({
            where: searchWhere(['name', 'email', 'phone'], query),
            select: { id: true, name: true, email: true, phone: true, isActive: true },
            take: limit,
            skip: offset,
            orderBy: { updatedAt: 'desc' },
          })
          .then((items) => ({
            key: 'customer' as CategoryKey,
            results: items.map((c) => ({
              id: c.id,
              title: c.name,
              subtitle: c.email || c.phone || '',
              status: c.isActive ? 'active' : 'inactive',
              category: 'customer',
              href: `customers?id=${c.id}`,
            })),
          }))
      )
    }

    if (categoriesToSearch.includes('invoice') && (isAdmin || isAccountant || isStoreManager)) {
      searchPromises.push(
        db.invoice
          .findMany({
            where: searchWhere(['invoiceNo', 'notes'], query),
            select: { id: true, invoiceNo: true, status: true, type: true, projectId: true, notes: true },
            take: limit,
            skip: offset,
            orderBy: { createdAt: 'desc' },
          })
          .then((items) => ({
            key: 'invoice' as CategoryKey,
            results: items.map((inv) => ({
              id: inv.id,
              title: inv.invoiceNo,
              subtitle: inv.type || '',
              status: inv.status,
              category: 'invoice',
              href: `project-detail?id=${inv.projectId}`,
            })),
          }))
      )
    }

    if (categoriesToSearch.includes('payment') && (isAdmin || isAccountant)) {
      searchPromises.push(
        db.payment
          .findMany({
            where: searchWhere(['paymentNo', 'reference', 'notes'], query),
            select: { id: true, paymentNo: true, status: true, method: true, amount: true, projectId: true },
            take: limit,
            skip: offset,
            orderBy: { createdAt: 'desc' },
          })
          .then((items) => ({
            key: 'payment' as CategoryKey,
            results: items.map((p) => ({
              id: p.id,
              title: p.paymentNo,
              subtitle: `${p.method} - ${p.amount}`,
              status: p.status,
              category: 'payment',
              href: `project-detail?id=${p.projectId}`,
            })),
          }))
      )
    }

    if (categoriesToSearch.includes('purchase_order')) {
      searchPromises.push(
        db.purchaseOrder
          .findMany({
            where: searchWhere(['orderNo', 'notes'], query),
            select: { id: true, orderNo: true, status: true, total: true, projectId: true, notes: true },
            take: limit,
            skip: offset,
            orderBy: { createdAt: 'desc' },
          })
          .then((items) => ({
            key: 'purchase_order' as CategoryKey,
            results: items.map((po) => ({
              id: po.id,
              title: po.orderNo,
              subtitle: `Total: ${po.total}`,
              status: po.status,
              category: 'purchase_order',
              href: `project-detail?id=${po.projectId}`,
            })),
          }))
      )
    }

    if (categoriesToSearch.includes('purchase_request')) {
      searchPromises.push(
        db.purchaseRequest
          .findMany({
            where: searchWhere(['requestNo', 'notes'], query),
            select: { id: true, requestNo: true, status: true, projectId: true, notes: true },
            take: limit,
            skip: offset,
            orderBy: { createdAt: 'desc' },
          })
          .then((items) => ({
            key: 'purchase_request' as CategoryKey,
            results: items.map((pr) => ({
              id: pr.id,
              title: pr.requestNo,
              subtitle: pr.notes?.substring(0, 80) || '',
              status: pr.status,
              category: 'purchase_request',
              href: `project-detail?id=${pr.projectId}`,
            })),
          }))
      )
    }

    if (categoriesToSearch.includes('supplier')) {
      searchPromises.push(
        db.supplier
          .findMany({
            where: searchWhere(['name', 'contact', 'phone', 'email'], query),
            select: { id: true, name: true, contact: true, phone: true, email: true, isActive: true, code: true },
            take: limit,
            skip: offset,
            orderBy: { updatedAt: 'desc' },
          })
          .then((items) => ({
            key: 'supplier' as CategoryKey,
            results: items.map((s) => ({
              id: s.id,
              title: s.name,
              subtitle: s.contact || s.phone || s.email || '',
              status: s.isActive ? 'active' : 'inactive',
              category: 'supplier',
              href: `suppliers?id=${s.id}`,
            })),
          }))
      )
    }

    if (categoriesToSearch.includes('stock')) {
      searchPromises.push(
        db.material
          .findMany({
            where: searchWhere(['name', 'code'], query),
            select: { id: true, name: true, code: true, unit: true, currentStock: true, unitPrice: true },
            take: limit,
            skip: offset,
            orderBy: { updatedAt: 'desc' },
          })
          .then((items) => ({
            key: 'stock' as CategoryKey,
            results: items.map((m) => ({
              id: m.id,
              title: m.name,
              subtitle: `${m.code} | Stock: ${m.currentStock} ${m.unit}`,
              status: m.currentStock > (m.minStock || 0) ? 'in_stock' : 'low_stock',
              category: 'stock',
              href: `inventory?id=${m.id}`,
            })),
          }))
      )
    }

    if (categoriesToSearch.includes('employee')) {
      searchPromises.push(
        db.employee
          .findMany({
            where: searchWhere(['name', 'empCode', 'email', 'phone', 'department', 'designation'], query),
            select: { id: true, name: true, empCode: true, email: true, department: true, designation: true, isActive: true },
            take: limit,
            skip: offset,
            orderBy: { updatedAt: 'desc' },
          })
          .then((items) => ({
            key: 'employee' as CategoryKey,
            results: items.map((e) => ({
              id: e.id,
              title: e.name,
              subtitle: `${e.designation || ''} ${e.department ? '- ' + e.department : ''}`.trim(),
              status: e.isActive ? 'active' : 'inactive',
              category: 'employee',
              href: `employees?id=${e.id}`,
            })),
          }))
      )
    }

    if (categoriesToSearch.includes('asset')) {
      searchPromises.push(
        db.asset
          .findMany({
            where: searchWhere(['name', 'code'], query),
            select: { id: true, name: true, code: true, type: true, status: true, location: true },
            take: limit,
            skip: offset,
            orderBy: { updatedAt: 'desc' },
          })
          .then((items) => ({
            key: 'asset' as CategoryKey,
            results: items.map((a) => ({
              id: a.id,
              title: a.name,
              subtitle: `${a.code} | ${a.type}${a.location ? ' | ' + a.location : ''}`,
              status: a.status,
              category: 'asset',
              href: `assets?id=${a.id}`,
            })),
          }))
      )
    }

    if (categoriesToSearch.includes('attendance')) {
      searchPromises.push(
        db.attendance
          .findMany({
            where: searchWhere(['labourId'], query),
            select: { id: true, labourId: true, date: true, status: true, hoursWorked: true, projectId: true },
            take: limit,
            skip: offset,
            orderBy: { date: 'desc' },
          })
          .then(async (items) => {
            // Enrich with labour names
            const labourIds = [...new Set(items.map((a) => a.labourId))]
            const labours =
              labourIds.length > 0
                ? await db.labour.findMany({
                    where: { id: { in: labourIds } },
                    select: { id: true, name: true },
                  })
                : []
            const labourMap = new Map(labours.map((l) => [l.id, l.name]))

            return {
              key: 'attendance' as CategoryKey,
              results: items.map((a) => ({
                id: a.id,
                title: labourMap.get(a.labourId) || a.labourId,
                subtitle: `${a.date.toISOString().split('T')[0]} | ${a.hoursWorked || 0}h`,
                status: a.status,
                category: 'attendance',
                href: `project-detail?id=${a.projectId}`,
              })),
            }
          })
      )
    }

    if (categoriesToSearch.includes('task')) {
      const taskWhere = {
        AND: [
          searchWhere(['title', 'description'], query),
          ...(isLabour ? [{ assigneeId: user.id }] : []),
        ],
      }
      searchPromises.push(
        db.projectTask
          .findMany({
            where: taskWhere,
            select: { id: true, title: true, status: true, priority: true, projectId: true, description: true },
            take: limit,
            skip: offset,
            orderBy: { updatedAt: 'desc' },
          })
          .then((items) => ({
            key: 'task' as CategoryKey,
            results: items.map((t) => ({
              id: t.id,
              title: t.title,
              subtitle: t.priority,
              status: t.status,
              category: 'task',
              href: `project-detail?id=${t.projectId}`,
            })),
          }))
      )
    }

    if (categoriesToSearch.includes('user')) {
      searchPromises.push(
        db.user
          .findMany({
            where: searchWhere(['name', 'email', 'phone', 'role'], query),
            select: { id: true, name: true, email: true, role: true, isActive: true },
            take: limit,
            skip: offset,
            orderBy: { updatedAt: 'desc' },
          })
          .then((items) => ({
            key: 'user' as CategoryKey,
            results: items.map((u) => ({
              id: u.id,
              title: u.name,
              subtitle: `${u.role} | ${u.email}`,
              status: u.isActive ? 'active' : 'inactive',
              category: 'user',
              href: `users?id=${u.id}`,
            })),
          }))
      )
    }

    if (categoriesToSearch.includes('audit_log') && (isAdmin || isAuditor)) {
      searchPromises.push(
        db.auditLog
          .findMany({
            where: searchWhere(['action', 'entity'], query),
            select: { id: true, action: true, entity: true, createdAt: true, userId: true },
            take: limit,
            skip: offset,
            orderBy: { createdAt: 'desc' },
          })
          .then((items) => ({
            key: 'audit_log' as CategoryKey,
            results: items.map((a) => ({
              id: a.id,
              title: a.action,
              subtitle: `${a.entity}${a.userId ? ' | User: ' + a.userId.substring(0, 8) : ''}`,
              status: 'logged',
              category: 'audit_log',
              href: `audit-logs?id=${a.id}`,
            })),
          }))
      )
    }

    // Execute all searches in parallel
    const settled = await Promise.allSettled(searchPromises)

    const categories: Record<string, CategoryResult> = {}
    let totalResults = 0

    for (const result of settled) {
      if (result.status === 'fulfilled') {
        const { key, results } = result.value
        categories[key] = { total: results.length, items: results }
        totalResults += results.length
      }
    }

    // Fire-and-forget analytics
    db.searchAnalytics
      .create({
        data: {
          userId: user.id,
          query,
          resultsFound: totalResults,
          category: category || undefined,
        },
      })
      .catch(() => {})

    // Fire-and-forget search history
    db.searchHistory
      .upsert({
        where: {
          // SQLite doesn't have a unique constraint on userId+query, so we'll just create
          id: '', // This will fail and we'll catch it
        },
        create: {
          userId: user.id,
          query,
          category: category || null,
          resultCount: totalResults,
        },
        update: {},
      })
      .catch(() => {
        // Fallback: just create
        db.searchHistory
          .create({
            data: {
              userId: user.id,
              query,
              category: category || null,
              resultCount: totalResults,
            },
          })
          .catch(() => {})
      })

    // Transform to frontend-expected format: { total, categories: [{ category, items }] }
    const SEARCH_LABELS: Record<string, { label: string }> = {
      project: { label: 'Projects' },
      complaint: { label: 'Complaints' },
      work_order: { label: 'Work Orders' },
      customer: { label: 'Customers' },
      invoice: { label: 'Invoices' },
      payment: { label: 'Payments' },
      purchase_order: { label: 'Purchase Orders' },
      purchase_request: { label: 'Purchase Requests' },
      supplier: { label: 'Suppliers' },
      stock: { label: 'Inventory' },
      employee: { label: 'Employees' },
      asset: { label: 'Assets' },
      attendance: { label: 'Attendance' },
      task: { label: 'Tasks' },
      user: { label: 'Users' },
      audit_log: { label: 'Audit Logs' },
    }

    const categoriesArray = Object.entries(categories)
      .map(([key, value]) => ({
        category: {
          id: key,
          label: SEARCH_LABELS[key]?.label || key,
          icon: key,
        },
        items: value.items,
      }))
      .filter((c) => c.items.length > 0)

    return NextResponse.json({
      success: true,
      data: {
        total: totalResults,
        categories: categoriesArray,
      },
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
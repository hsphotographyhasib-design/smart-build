import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    // সব স্বাধীন গণনা সমান্তরালভাবে চালানো হচ্ছে
    const [
      totalLabour,
      assignedLabour,
      totalEquipment,
      equipmentInUse,
      totalVehicles,
      vehiclesInUse,
      upcomingShortages,
      activeAssignments,
      completedAssignments,
      totalCrews,
      pendingRequests,
      recentAssignments,
      idleLabourCount,
      idleAssetCount,
      labourProductivityRows,
      resourceCostThisMonth,
      productivityMonthlyCosts,
    ] = await Promise.all([
      // 1. Total active labour
      db.labour.count({ where: { isActive: true } }),

      // 2. Assigned labour (active assignments)
      db.resourceAssignment.count({
        where: { resourceType: 'labour', status: 'active' },
      }),

      // 4. Total equipment
      db.asset.count({ where: { type: 'equipment' } }),

      // 5. Equipment in use
      db.resourceAssignment.count({
        where: { resourceType: 'equipment', status: 'active' },
      }),

      // 7. Total vehicles
      db.asset.count({ where: { type: 'vehicle' } }),

      // 8. Vehicles in use
      db.resourceAssignment.count({
        where: { resourceType: 'vehicle', status: 'active' },
      }),

      // 12. Upcoming shortages
      db.resourceRequest.count({
        where: { status: 'pending', priority: 'high' },
      }),

      // 14. Active assignments
      db.resourceAssignment.count({ where: { status: 'active' } }),

      // 15. Completed assignments
      db.resourceAssignment.count({ where: { status: 'completed' } }),

      // 16. Total active crews
      db.crew.count({ where: { isActive: true } }),

      // 17. Pending requests
      db.resourceRequest.count({
        where: { status: { in: ['pending', 'supervisor_approved'] } },
      }),

      // recentAssignments: Last 10 with project name
      db.resourceAssignment.findMany({
        where: { status: 'active' },
        include: { project: { select: { id: true, name: true, code: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),

      // 13a. Idle labour: active labour NOT in active assignments
      db.$queryRawUnsafe<Array<{ cnt: number }>>(`
        SELECT COUNT(*) as cnt FROM Labour
        WHERE isActive = 1
        AND id NOT IN (
          SELECT DISTINCT resourceId FROM resource_assignments
          WHERE resourceType = 'labour' AND status = 'active'
        )
      `),

      // 13b. Idle assets: available assets of type equipment or vehicle
      db.asset.count({
        where: {
          status: 'available',
          type: { in: ['equipment', 'vehicle'] },
        },
      }),

      // 10. Labour productivity: avg outputQty/hoursWorked for labour in last 30 days
      db.$queryRawUnsafe<Array<{ avg_productivity: number }>>(`
        SELECT AVG(CASE WHEN hoursWorked > 0 THEN outputQty / hoursWorked ELSE 0 END) as avg_productivity
        FROM productivity_logs
        WHERE resourceType = 'labour'
        AND date >= datetime('now', '-30 days')
      `),

      // 11. Resource cost this month (from assignments + productivity logs)
      // অংশ ক: সক্রিয় অ্যাসাইনমেন্টের জন্য এই মাসে সক্রিয় দিন * dailyCost এর যোগফল
      db.$queryRawUnsafe<Array<{ total_cost: number }>>(`
        SELECT
          COALESCE(SUM(
            CASE
              WHEN status = 'active' THEN
                dailyCost * (
                  JULIANDAY(MIN(datetime('now'), strftime('%Y-%m-%d', 'now', '+1 month', '-1 day')))
                  - JULIANDAY(MAX(startDate, strftime('%Y-%m-01', 'now')))
                  + 1
                )
              WHEN status = 'completed' AND endDate IS NOT NULL THEN
                dailyCost * (
                  JULIANDAY(MIN(endDate, strftime('%Y-%m-%d', 'now', '+1 month', '-1 day')))
                  - JULIANDAY(MAX(startDate, strftime('%Y-%m-01', 'now')))
                  + 1
                )
              ELSE 0
            END
          ), 0) as total_cost
        FROM resource_assignments
        WHERE (status = 'active' OR status = 'completed')
        AND startDate <= strftime('%Y-%m-%d', 'now', '+1 month', '-1 day')
        AND (endDate IS NULL OR endDate >= strftime('%Y-%m-01', 'now'))
      `),

      // monthlyCosts: Last 6 months of productivity costs grouped by month
      db.$queryRawUnsafe<Array<{ month: string; total_cost: number }>>(`
        SELECT strftime('%Y-%m', date) as month, SUM(cost) as total_cost
        FROM productivity_logs
        WHERE date >= datetime('now', '-6 months', 'start of month')
        GROUP BY strftime('%Y-%m', date)
        ORDER BY month ASC
      `),
    ])

    // 3. Unassigned labour
    const unassignedLabour = totalLabour - assignedLabour

    // 6. Idle equipment
    const idleEquipment = totalEquipment - equipmentInUse

    // 9. Resource utilization
    const totalResources = totalLabour + totalEquipment + totalVehicles
    const usedResources = assignedLabour + equipmentInUse + vehiclesInUse
    const resourceUtilization = totalResources > 0
      ? Math.min(Math.round((usedResources / totalResources) * 100 * 100) / 100, 100)
      : 0

    // 10. Labour productivity value
    const labourProductivity = labourProductivityRows.length > 0
      ? Math.round((labourProductivityRows[0].avg_productivity || 0) * 100) / 100
      : 0

    // 11. Resource cost this month: assignments + productivity logs this month
    const assignmentCostThisMonth = resourceCostThisMonth.length > 0
      ? resourceCostThisMonth[0].total_cost || 0
      : 0

    const productivityCostThisMonth = await db.productivityLog.aggregate({
      _sum: { cost: true },
      where: {
        date: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    })

    const totalCostThisMonth = assignmentCostThisMonth + (productivityCostThisMonth._sum.cost || 0)

    // 13. Idle resources
    const idleResources = idleLabourCount[0].cnt + idleAssetCount

    // resourceTypeBreakdown: per resource type
    const labourBreakdown = {
      type: 'labour',
      total: totalLabour,
      assigned: assignedLabour,
      unassigned: unassignedLabour,
    }
    const equipmentBreakdown = {
      type: 'equipment',
      total: totalEquipment,
      assigned: equipmentInUse,
      unassigned: idleEquipment,
    }
    const vehicleBreakdown = {
      type: 'vehicle',
      total: totalVehicles,
      assigned: vehiclesInUse,
      unassigned: totalVehicles - vehiclesInUse,
    }

    // বিশ্লেষণের জন্য টুল/সাবকনট্রাক্টর/কর্মচারী অ্যাসাইনমেন্টও গণনা করা হচ্ছে
    const [toolAssignments, employeeAssignments, subcontractorAssignments] = await Promise.all([
      db.resourceAssignment.count({ where: { resourceType: 'tool', status: 'active' } }),
      db.resourceAssignment.count({ where: { resourceType: 'employee', status: 'active' } }),
      db.resourceAssignment.count({ where: { resourceType: 'subcontractor', status: 'active' } }),
    ])

    const [totalTools, totalEmployees, totalSubcontractors] = await Promise.all([
      db.asset.count({ where: { type: 'tool' } }),
      db.user.count({ where: { isActive: true, role: { not: 'labour' } } }),
      db.subcontractor.count(),
    ])

    const resourceTypeBreakdown = [
      labourBreakdown,
      equipmentBreakdown,
      vehicleBreakdown,
      {
        type: 'tool',
        total: totalTools,
        assigned: toolAssignments,
        unassigned: totalTools - toolAssignments,
      },
      {
        type: 'employee',
        total: totalEmployees,
        assigned: employeeAssignments,
        unassigned: totalEmployees - employeeAssignments,
      },
      {
        type: 'subcontractor',
        total: totalSubcontractors,
        assigned: subcontractorAssignments,
        unassigned: totalSubcontractors - subcontractorAssignments,
      },
    ]

    return NextResponse.json({
      success: true,
      data: {
        totalLabour,
        assignedLabour,
        unassignedLabour,
        totalEquipment,
        equipmentInUse,
        idleEquipment,
        totalVehicles,
        vehiclesInUse,
        resourceUtilization,
        labourProductivity,
        resourceCostThisMonth: totalCostThisMonth,
        upcomingShortages,
        idleResources,
        activeAssignments,
        completedAssignments,
        totalCrews,
        pendingRequests,
        recentAssignments: JSON.parse(JSON.stringify(recentAssignments)),
        resourceTypeBreakdown,
        monthlyCosts: productivityMonthlyCosts.map((row) => ({
          month: row.month,
          totalCost: row.total_cost,
        })),
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
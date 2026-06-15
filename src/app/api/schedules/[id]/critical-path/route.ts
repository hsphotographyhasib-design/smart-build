import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

interface ActivityNode {
  id: string
  activityId: string
  name: string
  duration: number
  startDate: Date | null
  finishDate: Date | null
  predecessors: Array<{ depType: string; lagDays: number; predecessorId: string }>
  successors: Array<{ depType: string; lagDays: number; successorId: string }>
  earlyStart: Date | null
  earlyFinish: Date | null
  lateStart: Date | null
  lateFinish: Date | null
  totalFloat: number
  freeFloat: number
  isOnCriticalPath: boolean
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const schedule = await db.schedule.findUnique({ where: { id } })
    if (!schedule) {
      return NextResponse.json({ success: false, error: 'Schedule not found' }, { status: 404 })
    }

    // Fetch all non-summary activities with dependencies
    const activities = await db.scheduleActivity.findMany({
      where: { scheduleId: id, taskType: { not: 'summary' } },
      include: {
        predecessors: {
          select: { depType: true, lagDays: true, leadDays: true, predecessorId: true },
        },
        successors: {
          select: { depType: true, lagDays: true, leadDays: true, successorId: true },
        },
      },
      orderBy: { order: 'asc' },
    })

    if (activities.length === 0) {
      return NextResponse.json({
        success: true,
        data: { criticalPath: [], totalDuration: 0, analysisDate: new Date().toISOString() },
      })
    }

    // Build activity map
    const activityMap = new Map<string, ActivityNode>()
    for (const a of activities) {
      activityMap.set(a.id, {
        id: a.id,
        activityId: a.activityId,
        name: a.name,
        duration: a.duration || 1,
        startDate: a.startDate,
        finishDate: a.finishDate,
        predecessors: a.predecessors.map((p) => ({
          depType: p.depType,
          lagDays: p.lagDays,
          predecessorId: p.predecessorId,
        })),
        successors: a.successors.map((s) => ({
          depType: s.depType,
          lagDays: s.lagDays,
          successorId: s.successorId,
        })),
        earlyStart: null,
        earlyFinish: null,
        lateStart: null,
        lateFinish: null,
        totalFloat: 0,
        freeFloat: 0,
        isOnCriticalPath: false,
      })
    }

    // Helper: add working days to a date
    function addDays(date: Date, days: number): Date {
      const result = new Date(date)
      result.setDate(result.getDate() + days)
      return result
    }

    // Helper: max date from array
    function maxDate(dates: Array<Date | null>): Date | null {
      const valid = dates.filter((d): d is Date => d !== null)
      if (valid.length === 0) return null
      return valid.reduce((a, b) => (a > b ? a : b))
    }

    function minDate(dates: Array<Date | null>): Date | null {
      const valid = dates.filter((d): d is Date => d !== null)
      if (valid.length === 0) return null
      return valid.reduce((a, b) => (a < b ? a : b))
    }

    // === FORWARD PASS ===
    // Topological sort using Kahn's algorithm
    const inDegree = new Map<string, number>()
    for (const [actId] of activityMap) {
      inDegree.set(actId, 0)
    }
    for (const [, node] of activityMap) {
      for (const succ of node.successors) {
        const curr = inDegree.get(succ.successorId) ?? 0
        inDegree.set(succ.successorId, curr + 1)
      }
    }

    // Find start nodes (no predecessors)
    const startNodes: string[] = []
    for (const [actId, node] of activityMap) {
      if (node.predecessors.length === 0) {
        startNodes.push(actId)
      }
    }

    // Set earliest start date
    const projectStart = schedule.startDate || new Date()

    // Initialize start nodes
    for (const nodeId of startNodes) {
      const node = activityMap.get(nodeId)!
      node.earlyStart = node.startDate || new Date(projectStart)
      node.earlyFinish = addDays(node.earlyStart, node.duration)
    }

    // BFS topological sort for forward pass
    const queue = [...startNodes]
    const visited = new Set<string>()
    for (const n of startNodes) visited.add(n)

    while (queue.length > 0) {
      const currentId = queue.shift()!
      const currentNode = activityMap.get(currentId)!

      for (const succRel of currentNode.successors) {
        const succId = succRel.successorId
        const succNode = activityMap.get(succId)
        if (!succNode) continue

        // Calculate constraint based on dependency type
        let constraintStart: Date | null = null
        switch (succRel.depType) {
          case 'FS': // Finish-to-Start
            constraintStart = addDays(currentNode.earlyFinish!, succRel.lagDays)
            break
          case 'SS': // Start-to-Start
            constraintStart = addDays(currentNode.earlyStart!, succRel.lagDays)
            break
          case 'FF': // Finish-to-Finish
            if (succNode.earlyFinish !== null) {
              const ffConstraint = addDays(currentNode.earlyFinish!, succRel.lagDays)
              const currentDuration = succNode.duration
              const impliedStart = new Date(ffConstraint.getTime() - currentDuration * 24 * 60 * 60 * 1000)
              constraintStart = impliedStart
            }
            break
          case 'SF': // Start-to-Finish
            if (succNode.earlyFinish !== null) {
              const sfConstraint = addDays(currentNode.earlyStart!, succRel.lagDays)
              const currentDuration = succNode.duration
              const impliedStart = new Date(sfConstraint.getTime() - currentDuration * 24 * 60 * 60 * 1000)
              constraintStart = impliedStart
            }
            break
        }

        // Take the latest of all predecessor constraints
        if (constraintStart && succNode.earlyStart) {
          if (constraintStart > succNode.earlyStart) {
            succNode.earlyStart = constraintStart
          }
        } else if (constraintStart) {
          succNode.earlyStart = constraintStart
        }

        // Recalculate early finish
        if (succNode.earlyStart) {
          succNode.earlyFinish = addDays(succNode.earlyStart, succNode.duration)
        }

        if (!visited.has(succId)) {
          visited.add(succId)
          queue.push(succId)
        }
      }
    }

    // Ensure all nodes have early start/finish
    for (const [, node] of activityMap) {
      if (!node.earlyStart) node.earlyStart = node.startDate || new Date(projectStart)
      if (!node.earlyFinish) node.earlyFinish = addDays(node.earlyStart, node.duration)
    }

    // === BACKWARD PASS ===
    // Find project end (latest early finish)
    let projectEnd = new Date(0)
    for (const [, node] of activityMap) {
      if (node.earlyFinish && node.earlyFinish > projectEnd) {
        projectEnd = node.earlyFinish
      }
    }

    // Find end nodes (no successors)
    const endNodes: string[] = []
    for (const [actId, node] of activityMap) {
      if (node.successors.length === 0) {
        endNodes.push(actId)
      }
    }

    // Initialize end nodes
    for (const nodeId of endNodes) {
      const node = activityMap.get(nodeId)!
      node.lateFinish = new Date(projectEnd)
      node.lateStart = addDays(node.lateFinish, -node.duration)
    }

    // Reverse BFS for backward pass
    const reverseQueue = [...endNodes]
    const reverseVisited = new Set<string>()
    for (const n of endNodes) reverseVisited.add(n)

    while (reverseQueue.length > 0) {
      const currentId = reverseQueue.shift()!
      const currentNode = activityMap.get(currentId)!

      for (const predRel of currentNode.predecessors) {
        const predId = predRel.predecessorId
        const predNode = activityMap.get(predId)
        if (!predNode) continue

        // Calculate constraint based on dependency type
        let constraintFinish: Date | null = null
        switch (predRel.depType) {
          case 'FS':
            constraintFinish = addDays(currentNode.lateStart!, -predRel.lagDays)
            break
          case 'SS':
            constraintFinish = addDays(currentNode.lateStart!, -predRel.lagDays + predNode.duration)
            break
          case 'FF':
            constraintFinish = addDays(currentNode.lateFinish!, -predRel.lagDays)
            break
          case 'SF':
            constraintFinish = addDays(currentNode.lateFinish!, -predRel.lagDays + predNode.duration)
            break
        }

        // Take the earliest of all successor constraints
        if (constraintFinish && predNode.lateFinish) {
          if (constraintFinish < predNode.lateFinish) {
            predNode.lateFinish = constraintFinish
          }
        } else if (constraintFinish) {
          predNode.lateFinish = constraintFinish
        }

        // Recalculate late start
        if (predNode.lateFinish) {
          predNode.lateStart = addDays(predNode.lateFinish, -predNode.duration)
        }

        if (!reverseVisited.has(predId)) {
          reverseVisited.add(predId)
          reverseQueue.push(predId)
        }
      }
    }

    // Ensure all nodes have late start/finish
    for (const [, node] of activityMap) {
      if (!node.lateFinish) node.lateFinish = new Date(projectEnd)
      if (!node.lateStart) node.lateStart = addDays(node.lateFinish, -node.duration)
    }

    // === CALCULATE FLOAT & MARK CRITICAL PATH ===
    let totalProjectDuration = 0
    const criticalPath: Array<{
      id: string
      activityId: string
      name: string
      duration: number
      earlyStart: Date
      earlyFinish: Date
      lateStart: Date
      lateFinish: Date
      totalFloat: number
    }> = []

    for (const [actId, node] of activityMap) {
      // Total float = Late Start - Early Start (in days)
      const floatMs = node.lateStart!.getTime() - node.earlyStart!.getTime()
      node.totalFloat = Math.round(floatMs / (1000 * 60 * 60 * 24) * 100) / 100

      // Free float = minimum(Early Start of successors - Early Finish of this - lag)
      let minFreeFloat = Infinity
      for (const succRel of node.successors) {
        const succNode = activityMap.get(succRel.successorId)
        if (!succNode?.earlyStart || !node.earlyFinish) continue
        let succES: Date
        switch (succRel.depType) {
          case 'FS':
            succES = addDays(succNode.earlyStart, -succRel.lagDays)
            break
          case 'SS':
            succES = addDays(succNode.earlyStart, -succRel.lagDays)
            break
          default:
            succES = succNode.earlyStart
        }
        const ff = (succES.getTime() - node.earlyFinish.getTime()) / (1000 * 60 * 60 * 24)
        if (ff < minFreeFloat) minFreeFloat = ff
      }
      node.freeFloat = minFreeFloat === Infinity ? node.totalFloat : Math.round(minFreeFloat * 100) / 100

      // Mark critical path (totalFloat <= 0, with small tolerance)
      node.isOnCriticalPath = node.totalFloat <= 0.5

      if (node.earlyFinish && node.earlyFinish > new Date(projectStart.getTime() + totalProjectDuration * 24 * 60 * 60 * 1000)) {
        totalProjectDuration = Math.ceil((node.earlyFinish.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24))
      }
    }

    // Build ordered critical path
    for (const [, node] of activityMap) {
      if (node.isOnCriticalPath) {
        criticalPath.push({
          id: node.id,
          activityId: node.activityId,
          name: node.name,
          duration: node.duration,
          earlyStart: node.earlyStart!,
          earlyFinish: node.earlyFinish!,
          lateStart: node.lateStart!,
          lateFinish: node.lateFinish!,
          totalFloat: node.totalFloat,
        })
      }
    }

    // Sort critical path by early start
    criticalPath.sort((a, b) => a.earlyStart.getTime() - b.earlyStart.getTime())

    // Update all activities in the database with calculated values
    const updatePromises: Promise<unknown>[] = []
    for (const [actId, node] of activityMap) {
      updatePromises.push(
        db.scheduleActivity.update({
          where: { id: actId },
          data: {
            earlyStart: node.earlyStart,
            earlyFinish: node.earlyFinish,
            lateStart: node.lateStart,
            lateFinish: node.lateFinish,
            totalFloat: node.totalFloat,
            freeFloat: node.freeFloat,
            floatDays: node.totalFloat,
            isOnCriticalPath: node.isOnCriticalPath,
          },
        })
      )
    }
    await Promise.all(updatePromises)

    // Update schedule total duration
    if (totalProjectDuration > 0) {
      await db.schedule.update({
        where: { id },
        data: { totalDuration: totalProjectDuration },
      })
    }

    // All activities summary
    const allActivitiesSummary = Array.from(activityMap.values()).map((n) => ({
      id: n.id,
      activityId: n.activityId,
      name: n.name,
      duration: n.duration,
      earlyStart: n.earlyStart?.toISOString() ?? null,
      earlyFinish: n.earlyFinish?.toISOString() ?? null,
      lateStart: n.lateStart?.toISOString() ?? null,
      lateFinish: n.lateFinish?.toISOString() ?? null,
      totalFloat: n.totalFloat,
      freeFloat: n.freeFloat,
      isOnCriticalPath: n.isOnCriticalPath,
    }))

    return NextResponse.json({
      success: true,
      data: {
        criticalPath,
        allActivities: allActivitiesSummary,
        totalProjectDuration,
        projectStart: projectStart.toISOString(),
        projectEnd: projectEnd.toISOString(),
        criticalPathCount: criticalPath.length,
        totalActivitiesAnalyzed: activityMap.size,
        analysisDate: new Date().toISOString(),
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to compute critical path'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ packageId: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { packageId } = await params
    const body = await request.json()
    const { scores } = body

    const pkg = await db.tenderBidPackage.findUnique({ where: { id: packageId } })
    if (!pkg) {
      return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 })
    }

    // Get all submitted bids
    const bids = await db.tenderBid.findMany({
      where: { packageId, status: 'submitted' },
      include: {
        vendor: { select: { id: true, companyName: true } },
        itemPrices: true,
      },
    })

    if (bids.length === 0) {
      return NextResponse.json({ success: false, error: 'No submitted bids to evaluate' }, { status: 400 })
    }

    // Get evaluation criteria
    const criteriaList = await db.tenderEvaluationCriteria.findMany({
      where: { packageId },
      orderBy: { sortOrder: 'asc' },
    })

    if (criteriaList.length === 0) {
      return NextResponse.json({ success: false, error: 'No evaluation criteria defined for this package' }, { status: 400 })
    }

    const technicalWeight = criteriaList
      .filter((c) => c.type === 'technical')
      .reduce((sum, c) => sum + c.weight, 0)
    const commercialWeight = criteriaList
      .filter((c) => c.type === 'commercial')
      .reduce((sum, c) => sum + c.weight, 0)

    // Find the lowest bid amount for commercial scoring
    const lowestBidAmount = Math.min(...bids.map((b) => b.totalAmount))
    const highestBidAmount = Math.max(...bids.map((b) => b.totalAmount))
    const bidRange = highestBidAmount - lowestBidAmount || 1

    const evaluations: Array<Awaited<ReturnType<typeof db.tenderEvaluation.update>>> = []

    for (const bid of bids) {
      // Check if scores were provided, otherwise calculate defaults
      const bidScores = scores?.filter((s: Record<string, unknown>) => s.bidId === bid.id) || []

      // Upsert evaluation record
      const evaluation = await db.tenderEvaluation.upsert({
        where: { bidId: bid.id },
        update: {},
        create: {
          packageId,
          bidId: bid.id,
          evaluatorId: authUser.id,
        },
      })

      // Save individual scores
      let technicalTotal = 0
      let technicalMax = 0
      let commercialTotal = 0
      let commercialMax = 0

      for (const criteria of criteriaList) {
        const providedScore = bidScores.find(
          (s: Record<string, unknown>) => s.criteriaId === criteria.id
        )

        let score = 0
        if (providedScore) {
          score = Math.min(100, Math.max(0, Number(providedScore.score) || 0))
        } else if (criteria.type === 'commercial') {
          // Auto-calculate commercial score: lowest price gets 100
          if (highestBidAmount === lowestBidAmount) {
            score = 100
          } else {
            score = Math.round(((highestBidAmount - bid.totalAmount) / bidRange) * 100)
          }
        }

        await db.tenderEvaluationScore.upsert({
          where: {
            evaluationId_criteriaId: {
              evaluationId: evaluation.id,
              criteriaId: criteria.id,
            },
          },
          update: { score, notes: providedScore?.notes || null },
          create: {
            evaluationId: evaluation.id,
            criteriaId: criteria.id,
            score,
            notes: providedScore?.notes || null,
          },
        })

        if (criteria.type === 'technical') {
          technicalTotal += score * criteria.weight
          technicalMax += 100 * criteria.weight
        } else {
          commercialTotal += score * criteria.weight
          commercialMax += 100 * criteria.weight
        }
      }

      const technicalScore = technicalMax > 0 ? Math.round((technicalTotal / technicalMax) * 100) : 0
      const commercialScore = commercialMax > 0 ? Math.round((commercialTotal / commercialMax) * 100) : 0

      // Combined score using weighted average of technical and commercial
      const totalWeight = technicalWeight + commercialWeight || 100
      const combinedScore = Math.round(
        (technicalScore * (technicalWeight / totalWeight)) +
        (commercialScore * (commercialWeight / totalWeight))
      )

      const updatedEval = await db.tenderEvaluation.update({
        where: { id: evaluation.id },
        data: { technicalScore, commercialScore, combinedScore },
        include: {
          bid: { include: { vendor: { select: { id: true, companyName: true } } } },
        },
      })

      evaluations.push(updatedEval)
    }

    // Auto-rank by combined score (descending)
    const sorted = evaluations.sort((a, b) => b.combinedScore - a.combinedScore)
    for (let i = 0; i < sorted.length; i++) {
      await db.tenderEvaluation.update({
        where: { id: sorted[i].id },
        data: { ranking: i + 1, isRecommended: i === 0 },
      })
    }

    // Update package status
    await db.tenderBidPackage.update({
      where: { id: packageId },
      data: { status: 'under_evaluation' },
    })

    // Get final evaluations with rankings
    const finalEvaluations = await db.tenderEvaluation.findMany({
      where: { packageId },
      include: {
        bid: { include: { vendor: { select: { id: true, companyName: true } } } },
        scores: { include: { criteria: true } },
        evaluator: { select: { id: true, name: true } },
      },
      orderBy: { ranking: 'asc' },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(finalEvaluations)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to evaluate bids'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
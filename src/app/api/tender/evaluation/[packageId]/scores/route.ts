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
    const { bidId, scores } = body

    if (!bidId || !scores || !Array.isArray(scores)) {
      return NextResponse.json({ success: false, error: 'bidId and scores array are required' }, { status: 400 })
    }

    // Ensure evaluation exists
    const evaluation = await db.tenderEvaluation.upsert({
      where: { bidId },
      update: {},
      create: {
        packageId,
        bidId,
        evaluatorId: authUser.id,
      },
    })

    const savedScores: Array<Awaited<ReturnType<typeof db.tenderEvaluationScore.upsert>>> = []
    for (const s of scores) {
      if (!s.criteriaId) continue

      const score = await db.tenderEvaluationScore.upsert({
        where: {
          evaluationId_criteriaId: {
            evaluationId: evaluation.id,
            criteriaId: s.criteriaId,
          },
        },
        update: {
          score: Math.min(100, Math.max(0, Number(s.score) || 0)),
          notes: s.notes || null,
        },
        create: {
          evaluationId: evaluation.id,
          criteriaId: s.criteriaId,
          score: Math.min(100, Math.max(0, Number(s.score) || 0)),
          notes: s.notes || null,
        },
        include: { criteria: true },
      })
      savedScores.push(score)
    }

    // Recalculate evaluation scores
    const allScores = await db.tenderEvaluationScore.findMany({
      where: { evaluationId: evaluation.id },
      include: { criteria: true },
    })

    const criteriaList = await db.tenderEvaluationCriteria.findMany({
      where: { packageId },
    })

    let technicalTotal = 0
    let technicalMax = 0
    let commercialTotal = 0
    let commercialMax = 0

    for (const s of allScores) {
      if (s.criteria.type === 'technical') {
        technicalTotal += s.score * s.criteria.weight
        technicalMax += 100 * s.criteria.weight
      } else {
        commercialTotal += s.score * s.criteria.weight
        commercialMax += 100 * s.criteria.weight
      }
    }

    const technicalScore = technicalMax > 0 ? Math.round((technicalTotal / technicalMax) * 100) : 0
    const commercialScore = commercialMax > 0 ? Math.round((commercialTotal / commercialMax) * 100) : 0

    const technicalWeight = criteriaList.filter((c) => c.type === 'technical').reduce((sum, c) => sum + c.weight, 0)
    const commercialWeight = criteriaList.filter((c) => c.type === 'commercial').reduce((sum, c) => sum + c.weight, 0)
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
        scores: { include: { criteria: true } },
      },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(updatedEval)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save evaluation scores'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
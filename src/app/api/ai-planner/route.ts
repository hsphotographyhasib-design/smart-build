import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { prompt, projectId } = body as { prompt?: string; projectId?: string }

  let context = ''
  if (projectId) {
    const p = await db.project.findUnique({
      where: { id: projectId },
      include: { activities: { take: 60, orderBy: { activityId: 'asc' } }, risks: { take: 10 } },
    })
    if (p) {
      context = `PROJECT: ${p.code} — ${p.name}\nStatus: ${p.status} | Health: ${p.health} | Progress: ${p.progress}%\nBudget: $${p.budget.toLocaleString()} | Actual: $${p.actualCost.toLocaleString()} | Forecast: $${p.forecastCost.toLocaleString()}\nStart: ${p.startDate?.toISOString().slice(0,10)} | Finish: ${p.finishDate?.toISOString().slice(0,10)}\n\nKEY ACTIVITIES:\n${p.activities.map(a => `- ${a.activityId}: ${a.name} | ${a.status} | ${a.progress}% | dur ${a.duration}d | float ${a.totalFloat}d | critical ${a.isCritical}`).join('\n')}\n\nTOP RISKS:\n${p.risks.map(r => `- [${r.probability}x${r.impact}=${r.probability*r.impact}] ${r.title} (${r.status})`).join('\n')}`
    }
  } else {
    const [projects, risks, activities] = await Promise.all([
      db.project.findMany({ take: 20 }),
      db.risk.findMany({ take: 12, orderBy: { raisedDate: 'desc' } }),
      db.activity.count(),
    ])
    context = `PORTFOLIO SNAPSHOT:\n- ${projects.length} active projects, ${activities} activities\n- Total budget: $${projects.reduce((s,p)=>s+p.budget,0).toLocaleString()}\n- Avg progress: ${(projects.reduce((s,p)=>s+p.progress,0)/Math.max(1,projects.length)).toFixed(1)}%\nHealth: Green ${projects.filter(p=>p.health==='Green').length} / Yellow ${projects.filter(p=>p.health==='Yellow').length} / Red ${projects.filter(p=>p.health==='Red').length}\n\nTOP RISKS:\n${risks.map(r=>`- [${r.probability}x${r.impact}] ${r.title}`).join('\n')}`
  }

  const userPrompt = prompt || 'Analyse the portfolio. Identify the top 3 schedule risks, recommend recovery actions, and forecast likely completion slippage. Be concise and actionable.'

  try {
    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: 'You are SmartBuild AI Planner, a senior Primavera P6 project controls consultant and delay analyst embedded in an Enterprise Project Portfolio Management platform. You give concise, decisive, data-driven recommendations to planning managers, PMO directors and project controls engineers. Use markdown headings, bullet points and short tables where helpful. Reference real activity IDs, floats and costs. Never apologise, never invent data not provided.' },
        { role: 'user', content: `CONTEXT:\n${context}\n\nREQUEST:\n${userPrompt}` },
      ],
      thinking: { type: 'disabled' },
    })
    const content = completion.choices[0]?.message?.content ?? 'No response generated.'
    return NextResponse.json({ content, context })
  } catch (e: any) {
    return NextResponse.json({
      content: `### AI Planner (offline fallback)\n\nI couldn't reach the reasoning service right now.\n\n**Your request:** ${userPrompt}\n\nBased on the loaded context, here are immediate priorities:\n\n1. **Critical path activities** with zero float must be protected — any slippage delays the project 1:1.\n2. **High-score risks** (>=15) require active mitigation owners with response budgets allocated.\n3. **CPI < 1.0** indicates cost overrun trend — review EAC against approved budget.\n\n_Please retry in a moment for a full AI analysis._`,
      context,
      error: e?.message,
    }, { status: 200 })
  }
}

import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

const day = 86400000
// Base anchored so "today" lands ~portfolio-day-258 (mid-flight, realistic EVM/progress)
const D = (offset: number) => new Date(Date.UTC(2025, 9, 15) + offset * day)

async function main() {
  console.log('🌱 Seeding SmartBuild EPPM...')

  // ---------- USERS ----------
  const users = await db.appUser.createMany({
    data: [
      { name: 'Daniel Okafor', email: 'daniel@smartbuild.io', role: 'Super Admin' },
      { name: 'Sarah Lim', email: 'sarah@smartbuild.io', role: 'Portfolio Director' },
      { name: 'Raj Patel', email: 'raj@smartbuild.io', role: 'Planning Manager' },
      { name: 'Maria Santos', email: 'maria@smartbuild.io', role: 'Project Manager' },
      { name: 'Ahmed Hassan', email: 'ahmed@smartbuild.io', role: 'Project Controls Manager' },
      { name: 'Chen Wei', email: 'chen@smartbuild.io', role: 'Scheduler' },
      { name: 'Lisa Brown', email: 'lisa@smartbuild.io', role: 'Quantity Surveyor' },
      { name: 'Tom Wilson', email: 'tom@smartbuild.io', role: 'Site Engineer' },
    ],
  })

  // ---------- PORTFOLIOS ----------
  const [pInfra, pBuild, pInd] = await db.$transaction([
    db.portfolio.create({ data: {
      code: 'PORT-INFRA-01', name: 'Infrastructure & Civil Works', businessUnit: 'Infrastructure',
      department: 'Civil Engineering', client: 'Ministry of Transport', status: 'Active', health: 'Yellow',
      budget: 485000000, startDate: D(0), endDate: D(720), managerId: 'Sarah Lim',
    }}),
    db.portfolio.create({ data: {
      code: 'PORT-BLDG-01', name: 'Commercial & Residential Buildings', businessUnit: 'Buildings',
      department: 'Construction', client: 'Multiple', status: 'Active', health: 'Green',
      budget: 720000000, startDate: D(10), endDate: D(680), managerId: 'Sarah Lim',
    }}),
    db.portfolio.create({ data: {
      code: 'PORT-IND-01', name: 'Industrial & Energy Projects', businessUnit: 'Industrial',
      department: 'Energy', client: 'GreenPower Corp', status: 'Active', health: 'Red',
      budget: 950000000, startDate: D(20), endDate: D(800), managerId: 'Ahmed Hassan',
    }}),
  ])

  // ---------- PROGRAMS ----------
  const [metroProg, towerProg, solarProg] = await db.$transaction([
    db.program.create({ data: { code: 'PROG-METRO', name: 'Metro Line Extension Program', portfolioId: pInfra.id, budget: 285000000, status: 'Active', health: 'Yellow', startDate: D(0), endDate: D(720), managerId: 'Raj Patel' }}),
    db.program.create({ data: { code: 'PROG-TOWER', name: 'Twin Towers Development', portfolioId: pBuild.id, budget: 420000000, status: 'Active', health: 'Green', startDate: D(10), endDate: D(680), managerId: 'Maria Santos' }}),
    db.program.create({ data: { code: 'PROG-SOLAR', name: 'Solar Farm Megaproject', portfolioId: pInd.id, budget: 620000000, status: 'Active', health: 'Red', startDate: D(20), endDate: D(800), managerId: 'Ahmed Hassan' }}),
  ])

  // ---------- PROJECTS ----------
  const projects = await db.$transaction([
    db.project.create({ data: { code: 'PRJ-METRO-STA-A', name: 'Metro Station A — Underground', category: 'Infrastructure', priority: 'Critical', status: 'In Progress', health: 'Yellow', budget: 95000000, actualCost: 58200000, committedCost: 78000000, forecastCost: 97200000, revenue: 118000000, progress: 61, startDate: D(0), finishDate: D(420), baselineStart: D(0), baselineFinish: D(400), portfolioId: pInfra.id, programId: metroProg.id, managerId: 'Maria Santos', client: 'Ministry of Transport', location: 'Downtown Sector 4' }}),
    db.project.create({ data: { code: 'PRJ-METRO-TUN', name: 'Metro Tunnel Bored — Section 2', category: 'Infrastructure', priority: 'Critical', status: 'In Progress', health: 'Red', budget: 145000000, actualCost: 98000000, committedCost: 132000000, forecastCost: 152000000, revenue: 178000000, progress: 52, startDate: D(30), finishDate: D(560), baselineStart: D(20), baselineFinish: D(520), portfolioId: pInfra.id, programId: metroProg.id, managerId: 'Maria Santos', client: 'Ministry of Transport', location: 'Riverside Corridor' }}),
    db.project.create({ data: { code: 'PRJ-TWR-NORTH', name: 'North Tower — 45 Storey Commercial', category: 'Building', priority: 'High', status: 'In Progress', health: 'Green', budget: 185000000, actualCost: 82400000, committedCost: 150000000, forecastCost: 184000000, revenue: 265000000, progress: 44, startDate: D(15), finishDate: D(560), baselineStart: D(15), baselineFinish: D(550), portfolioId: pBuild.id, programId: towerProg.id, managerId: 'Maria Santos', client: 'Skyline Holdings', location: 'CBD District' }}),
    db.project.create({ data: { code: 'PRJ-TWR-SOUTH', name: 'South Tower — 38 Storey Residential', category: 'Building', priority: 'High', status: 'In Progress', health: 'Yellow', budget: 165000000, actualCost: 51200000, committedCost: 118000000, forecastCost: 170000000, revenue: 240000000, progress: 31, startDate: D(40), finishDate: D(600), baselineStart: D(40), baselineFinish: D(580), portfolioId: pBuild.id, programId: towerProg.id, managerId: 'Maria Santos', client: 'Skyline Holdings', location: 'CBD District' }}),
    db.project.create({ data: { code: 'PRJ-SOLAR-100MW', name: 'Solar Farm 100MW — Phase 1', category: 'Industrial', priority: 'Critical', status: 'In Progress', health: 'Red', budget: 320000000, actualCost: 168000000, committedCost: 285000000, forecastCost: 348000000, revenue: 410000000, progress: 48, startDate: D(20), finishDate: D(620), baselineStart: D(10), baselineFinish: D(580), portfolioId: pInd.id, programId: solarProg.id, managerId: 'Ahmed Hassan', client: 'GreenPower Corp', location: 'Desert Plateau East' }}),
    db.project.create({ data: { code: 'PRJ-BRIDGE-RIV', name: 'Riverside Cable-Stayed Bridge', category: 'Infrastructure', priority: 'High', status: 'In Progress', health: 'Yellow', budget: 78000000, actualCost: 35000000, committedCost: 62000000, forecastCost: 81000000, revenue: 96000000, progress: 38, startDate: D(60), finishDate: D(540), baselineStart: D(55), baselineFinish: D(520), portfolioId: pInfra.id, managerId: 'Raj Patel', client: 'City Council', location: 'River Mouth' }}),
    db.project.create({ data: { code: 'PRJ-HOSP-300', name: '300-Bed Specialist Hospital', category: 'Building', priority: 'Critical', status: 'In Progress', health: 'Green', budget: 210000000, actualCost: 64000000, committedCost: 145000000, forecastCost: 208000000, revenue: 295000000, progress: 28, startDate: D(50), finishDate: D(680), baselineStart: D(50), baselineFinish: D(670), portfolioId: pBuild.id, managerId: 'Maria Santos', client: 'Health Authority', location: 'Medical District' }}),
    db.project.create({ data: { code: 'PRJ-ROAD-HWY', name: 'Highway Expansion — 24km', category: 'Infrastructure', priority: 'Medium', status: 'In Progress', health: 'Green', budget: 88000000, actualCost: 41200000, committedCost: 70000000, forecastCost: 87500000, revenue: 110000000, progress: 47, startDate: D(35), finishDate: D(420), baselineStart: D(30), baselineFinish: D(410), portfolioId: pInfra.id, managerId: 'Raj Patel', client: 'Ministry of Transport', location: 'Highway E2' }}),
    db.project.create({ data: { code: 'PRJ-WTP-NEW', name: 'Water Treatment Plant — 200MLD', category: 'Industrial', priority: 'High', status: 'In Progress', health: 'Yellow', budget: 142000000, actualCost: 58000000, committedCost: 105000000, forecastCost: 146000000, revenue: 180000000, progress: 35, startDate: D(70), finishDate: D(560), baselineStart: D(65), baselineFinish: D(545), portfolioId: pInd.id, managerId: 'Ahmed Hassan', client: 'Water Utility', location: 'Riverside Industrial' }}),
    db.project.create({ data: { code: 'PRJ-MALL-LUX', name: 'Luxury Shopping Mall — 85k m²', category: 'Building', priority: 'Medium', status: 'In Progress', health: 'Green', budget: 125000000, actualCost: 38000000, committedCost: 88000000, forecastCost: 124000000, revenue: 175000000, progress: 24, startDate: D(90), finishDate: D(640), baselineStart: D(90), baselineFinish: D(640), portfolioId: pBuild.id, managerId: 'Maria Santos', client: 'Retail Group', location: 'Suburban Hub' }}),
    db.project.create({ data: { code: 'PRJ-PORT-EXP', name: 'Port Container Terminal Expansion', category: 'Industrial', priority: 'High', status: 'Planning', health: 'Green', budget: 265000000, actualCost: 5200000, committedCost: 28000000, forecastCost: 266000000, revenue: 340000000, progress: 4, startDate: D(120), finishDate: D(760), baselineStart: D(120), baselineFinish: D(760), portfolioId: pInd.id, managerId: 'Ahmed Hassan', client: 'Port Authority', location: 'East Coast' }}),
    db.project.create({ data: { code: 'PRJ-SCHOOL-12', name: '12-School Cluster Build', category: 'Building', priority: 'Medium', status: 'In Progress', health: 'Yellow', budget: 64000000, actualCost: 22800000, committedCost: 47000000, forecastCost: 65500000, revenue: 82000000, progress: 33, startDate: D(45), finishDate: D(450), baselineStart: D(40), baselineFinish: D(440), portfolioId: pBuild.id, managerId: 'Maria Santos', client: 'Education Ministry', location: 'Multiple Sites' }}),
  ])
  console.log(`  ✓ ${projects.length} projects`)

  // ---------- RESOURCES ----------
  const resDefs = [
    ['LAB-STRU', 'Structural Steel Crew A', 'Labour', 'Steel Fixer', 'day', 850, 8, 'Structural'],
    ['LAB-CONC', 'Concrete Pour Crew', 'Labour', 'Concreter', 'day', 720, 8, 'Civil'],
    ['LAB-MASN', 'Masonry Crew', 'Labour', 'Mason', 'day', 560, 8, 'Finishing'],
    ['LAB-ELEC', 'Electrical Team', 'Labour', 'Electrician', 'day', 680, 8, 'MEP'],
    ['LAB-MECH', 'MEP Mechanical Team', 'Labour', 'Mechanic', 'day', 700, 8, 'MEP'],
    ['LAB-PLUM', 'Plumbing Crew', 'Labour', 'Plumber', 'day', 540, 8, 'MEP'],
    ['LAB-PAINT', 'Painting & Finishing', 'Labour', 'Painter', 'day', 420, 8, 'Finishing'],
    ['LAB-SURV', 'Site Surveyor Team', 'Labour', 'Surveyor', 'day', 620, 8, 'Engineering'],
    ['EQP-CRANE', 'Tower Crane TC-7032', 'Equipment', 'Crane', 'day', 2400, 10, 'Lifting'],
    ['EQP-EXC', 'Hydraulic Excavator 35T', 'Equipment', 'Excavator', 'day', 1800, 10, 'Earthworks'],
    ['EQP-TBM', 'Tunnel Boring Machine', 'Equipment', 'TBM', 'day', 12500, 24, 'Tunnelling'],
    ['EQP-DOZER', 'Bulldozer D8T', 'Equipment', 'Bulldozer', 'day', 1600, 10, 'Earthworks'],
    ['EQP-PUMP', 'Concrete Pump 52m', 'Equipment', 'Pump', 'day', 1100, 10, 'Concreting'],
    ['EQP-LIFT', 'Mobile Crane 100T', 'Equipment', 'Crane', 'day', 1900, 10, 'Lifting'],
    ['MAT-CONC', 'Ready-Mix Concrete C40', 'Material', 'Concrete', 'm3', 145, 200, 'Materials'],
    ['MAT-STEEL', 'Reinforcement Steel Rebar', 'Material', 'Steel', 'ton', 820, 50, 'Materials'],
    ['MAT-STLSEC', 'Structural Steel Sections', 'Material', 'Steel', 'ton', 1450, 30, 'Materials'],
    ['MAT-CEM', 'Portland Cement', 'Material', 'Cement', 'ton', 95, 100, 'Materials'],
    ['MAT-PLY', 'Formwork Plywood', 'Material', 'Plywood', 'm2', 38, 500, 'Materials'],
    ['VEH-TRUCK', 'Tipper Truck 20m³', 'Vehicle', 'Truck', 'day', 480, 10, 'Logistics'],
    ['VEH-TRANS', 'Concrete Mixer Truck', 'Vehicle', 'Mixer', 'day', 520, 10, 'Logistics'],
    ['SUB-ELEC', 'Electrical Subcontractor — PowerSys', 'Subcontractor', 'Subcontractor', 'day', 2800, 16, 'MEP'],
    ['SUB-HVAC', 'HVAC Subcontractor — ClimateCo', 'Subcontractor', 'Subcontractor', 'day', 2600, 16, 'MEP'],
    ['CREW-TUN', 'Tunnelling Specialist Crew', 'Crew', 'Crew', 'day', 4200, 24, 'Tunnelling'],
  ]
  const resources = await db.$transaction(
    resDefs.map(r => db.resource.create({ data: {
      code: r[0], name: r[1], type: r[2], role: r[3], unit: r[4], rate: r[5] as number, maxUnits: r[6] as number,
      department: r[7], status: 'Active',
    }}))
  )
  const resById = Object.fromEntries(resources.map(x => [x.code, x.id]))
  console.log(`  ✓ ${resources.length} resources`)

  // ---------- WBS + ACTIVITIES + DEPENDENCIES ----------
  // Build a realistic WBS+activity network for a couple flagship projects, plus summary for others
  const buildNetwork = async (
    project: typeof projects[0],
    wbsTree: { code: string; name: string; children?: any[] },
    startOffset: number
  ) => {
    const createdWbs: Record<string, string> = {}

    const createWbs = async (node: any, parentId: string | null, level: number): Promise<string> => {
      const w = await db.wbs.create({ data: {
        code: node.code, name: node.name, projectId: project.id, parentId, level,
        weight: node.weight ?? 0, progress: node.progress ?? 0,
        startDate: D(startOffset), finishDate: D(startOffset + (node.dur ?? 60)),
        budget: node.budget ?? 0, actualCost: node.actual ?? 0,
      }})
      createdWbs[node.code] = w.id
      for (const c of node.children ?? []) await createWbs(c, w.id, level + 1)
      return w.id
    }
    const rootId = await createWbs(wbsTree, null, 1)

    // activities
    const actDefs = wbsTree.activities ?? []
    const actMap: Record<string, string> = {}
    for (const a of actDefs) {
      const wbsId = createdWbs[a.wbs] ?? rootId
      const s = D(startOffset + (a.start ?? 0))
      const f = D(startOffset + (a.start ?? 0) + (a.dur ?? 10))
      const prog = a.progress ?? 0
      const isCrit = a.critical ?? false
      const act = await db.activity.create({ data: {
        activityId: a.id, name: a.name, projectId: project.id, wbsId,
        type: a.type ?? 'Task Activity', status: prog >= 100 ? 'Completed' : prog > 0 ? 'In Progress' : 'Not Started',
        duration: a.dur ?? 10, remainingDur: Math.max(0, (a.dur ?? 10) - (a.dur ?? 10) * prog / 100),
        actualDur: (a.dur ?? 10) * prog / 100,
        startDate: s, finishDate: f, earlyStart: s, earlyFinish: f,
        lateStart: isCrit ? s : D(startOffset + (a.start ?? 0) + 3), lateFinish: isCrit ? f : D(startOffset + (a.start ?? 0) + (a.dur ?? 10) + 3),
        baselineStart: s, baselineFinish: f,
        progress: prog, totalFloat: isCrit ? 0 : (a.float ?? 5), freeFloat: isCrit ? 0 : (a.float ?? 3),
        isCritical: isCrit, calendar: 'Standard 5d', responsible: a.responsible ?? 'Planning',
        cost: a.cost ?? 0, actualCost: (a.cost ?? 0) * prog / 100,
      }})
      actMap[a.id] = act.id

      // resource assignments
      for (const asg of a.assign ?? []) {
        const rid = resById[asg.r]
        if (!rid) continue
        await db.resourceAssignment.create({ data: {
          activityId: act.id, resourceId: rid,
          plannedUnits: asg.units, actualUnits: asg.units * prog / 100,
          remainingUnits: asg.units * (1 - prog / 100),
          cost: asg.units * (resources.find(x => x.id === rid)?.rate ?? 0),
          unitsPerDay: asg.upd ?? 1,
        }})
      }
    }
    // dependencies
    for (const d of wbsTree.deps ?? []) {
      if (actMap[d.from] && actMap[d.to]) {
        await db.dependency.create({ data: {
          predecessorId: actMap[d.from], successorId: actMap[d.to],
          type: d.type ?? 'FS', lag: d.lag ?? 0,
        }})
      }
    }
  }

  // Flagship project 1: Metro Station A
  await buildNetwork(projects[0], {
    code: 'STA-A', name: 'Metro Station A — Project Root', weight: 100, progress: 61, budget: 95000000, actual: 58200000,
    activities: [
      { id: 'A1000', name: 'Site Mobilisation & Setup', wbs: 'STA-A', start: 0, dur: 15, progress: 100, critical: true, cost: 1800000, assign: [{ r: 'LAB-SURV', units: 80 }, { r: 'EQP-EXC', units: 15 }, { r: 'VEH-TRUCK', units: 30 }] },
      { id: 'A1010', name: 'Diaphragm Wall Construction', wbs: 'STA-A', start: 15, dur: 45, progress: 100, critical: true, cost: 9500000, assign: [{ r: 'LAB-CONC', units: 360 }, { r: 'EQP-CRANE', units: 90 }, { r: 'MAT-CONC', units: 4200 }, { r: 'MAT-STEEL', units: 180 }] },
      { id: 'A1020', name: 'Excavation & Dewatering', wbs: 'STA-A', start: 60, dur: 35, progress: 100, critical: true, cost: 6200000, assign: [{ r: 'EQP-EXC', units: 280 }, { r: 'EQP-DOZER', units: 70 }, { r: 'VEH-TRUCK', units: 700 }] },
      { id: 'A1030', name: 'Base Slab Concrete Pour', wbs: 'STA-A', start: 95, dur: 25, progress: 88, critical: true, cost: 7800000, assign: [{ r: 'LAB-CONC', units: 200 }, { r: 'EQP-PUMP', units: 50 }, { r: 'MAT-CONC', units: 5800 }, { r: 'MAT-STEEL', units: 320 }] },
      { id: 'A1040', name: 'Platform Level Slab', wbs: 'STA-A', start: 120, dur: 30, progress: 54, critical: true, cost: 8400000, assign: [{ r: 'LAB-CONC', units: 240 }, { r: 'LAB-STRU', units: 180 }, { r: 'EQP-CRANE', units: 90 }, { r: 'MAT-STEEL', units: 280 }] },
      { id: 'A1050', name: 'Concourse Level Slab', wbs: 'STA-A', start: 150, dur: 32, progress: 22, critical: true, cost: 8900000, assign: [{ r: 'LAB-CONC', units: 256 }, { r: 'LAB-STRU', units: 200 }, { r: 'EQP-CRANE', units: 96 }] },
      { id: 'A1060', name: 'MEP Rough-In Installation', wbs: 'STA-A', start: 165, dur: 60, progress: 12, critical: false, float: 18, cost: 11200000, assign: [{ r: 'LAB-ELEC', units: 480 }, { r: 'LAB-MECH', units: 360 }, { r: 'LAB-PLUM', units: 300 }, { r: 'SUB-ELEC', units: 120 }, { r: 'SUB-HVAC', units: 96 }] },
      { id: 'A1070', name: 'Architectural Finishes', wbs: 'STA-A', start: 195, dur: 70, progress: 0, critical: false, float: 12, cost: 9600000, assign: [{ r: 'LAB-MASN', units: 420 }, { r: 'LAB-PAINT', units: 280 }] },
      { id: 'A1080', name: 'Escalators & Lifts Install', wbs: 'STA-A', start: 225, dur: 40, progress: 0, critical: true, cost: 7400000, assign: [{ r: 'EQP-LIFT', units: 80 }, { r: 'SUB-ELEC', units: 60 }] },
      { id: 'A1090', name: 'Systems Integration & Testing', wbs: 'STA-A', start: 265, dur: 35, progress: 0, critical: true, cost: 5800000, assign: [{ r: 'SUB-ELEC', units: 140 }, { r: 'SUB-HVAC', units: 70 }] },
      { id: 'A1100', name: 'Commissioning & Handover', wbs: 'STA-A', start: 300, dur: 20, progress: 0, critical: true, cost: 2400000, assign: [{ r: 'LAB-SURV', units: 60 }] },
      { id: 'A1110', name: 'Milestone: Station Opening', wbs: 'STA-A', start: 320, dur: 0, progress: 0, critical: true, type: 'Finish Milestone', cost: 0, assign: [] },
    ],
    deps: [
      { from: 'A1000', to: 'A1010', type: 'FS' }, { from: 'A1010', to: 'A1020', type: 'FS' },
      { from: 'A1020', to: 'A1030', type: 'FS' }, { from: 'A1030', to: 'A1040', type: 'FS' },
      { from: 'A1040', to: 'A1050', type: 'FS' }, { from: 'A1040', to: 'A1060', type: 'SS', lag: 15 },
      { from: 'A1050', to: 'A1070', type: 'FS' }, { from: 'A1050', to: 'A1080', type: 'FS' },
      { from: 'A1060', to: 'A1090', type: 'FS' }, { from: 'A1080', to: 'A1090', type: 'FS' },
      { from: 'A1070', to: 'A1090', type: 'FS' }, { from: 'A1090', to: 'A1100', type: 'FS' },
      { from: 'A1100', to: 'A1110', type: 'FS' },
    ],
  }, 0)

  // Flagship project 2: North Tower
  await buildNetwork(projects[2], {
    code: 'TWR-N', name: 'North Tower — Project Root', weight: 100, progress: 44, budget: 185000000, actual: 82400000,
    activities: [
      { id: 'T1000', name: 'Site Clearance & Grading', wbs: 'TWR-N', start: 0, dur: 18, progress: 100, critical: true, cost: 2400000, assign: [{ r: 'EQP-EXC', units: 144 }, { r: 'EQP-DOZER', units: 54 }, { r: 'VEH-TRUCK', units: 216 }] },
      { id: 'T1010', name: 'Foundation Piling — 280No', wbs: 'TWR-N', start: 18, dur: 50, progress: 100, critical: true, cost: 12800000, assign: [{ r: 'EQP-CRANE', units: 150 }, { r: 'LAB-CONC', units: 400 }, { r: 'MAT-CONC', units: 6200 }, { r: 'MAT-STEEL', units: 240 }] },
      { id: 'T1020', name: 'Raft Foundation Pour', wbs: 'TWR-N', start: 68, dur: 22, progress: 100, critical: true, cost: 9600000, assign: [{ r: 'LAB-CONC', units: 176 }, { r: 'EQP-PUMP', units: 66 }, { r: 'MAT-CONC', units: 8400 }, { r: 'MAT-STEEL', units: 480 }] },
      { id: 'T1030', name: 'B1-B3 Basement Structure', wbs: 'TWR-N', start: 90, dur: 60, progress: 100, critical: true, cost: 18600000, assign: [{ r: 'LAB-STRU', units: 480 }, { r: 'LAB-CONC', units: 360 }, { r: 'EQP-CRANE', units: 300 }, { r: 'MAT-STLSEC', units: 420 }, { r: 'MAT-CONC', units: 5200 }] },
      { id: 'T1040', name: 'Podium Structure L1-L4', wbs: 'TWR-N', start: 150, dur: 55, progress: 82, critical: true, cost: 16400000, assign: [{ r: 'LAB-STRU', units: 440 }, { r: 'EQP-CRANE', units: 275 }, { r: 'MAT-STLSEC', units: 380 }] },
      { id: 'T1050', name: 'Tower Slabs L6-L20', wbs: 'TWR-N', start: 195, dur: 110, progress: 41, critical: true, cost: 32400000, assign: [{ r: 'LAB-STRU', units: 880 }, { r: 'LAB-CONC', units: 440 }, { r: 'EQP-CRANE', units: 550 }, { r: 'MAT-STLSEC', units: 720 }, { r: 'MAT-STEEL', units: 540 }] },
      { id: 'T1060', name: 'Tower Slabs L21-L35', wbs: 'TWR-N', start: 280, dur: 95, progress: 8, critical: true, cost: 28800000, assign: [{ r: 'LAB-STRU', units: 760 }, { r: 'EQP-CRANE', units: 475 }, { r: 'MAT-STLSEC', units: 640 }] },
      { id: 'T1070', name: 'Curtain Wall Facade L1-L25', wbs: 'TWR-N', start: 230, dur: 140, progress: 12, critical: false, float: 25, cost: 22600000, assign: [{ r: 'SUB-ELEC', units: 200 }, { r: 'EQP-LIFT', units: 280 }] },
      { id: 'T1080', name: 'MEP Installation L1-L45', wbs: 'TWR-N', start: 250, dur: 180, progress: 5, critical: false, float: 15, cost: 34200000, assign: [{ r: 'SUB-ELEC', units: 720 }, { r: 'SUB-HVAC', units: 540 }, { r: 'LAB-PLUM', units: 600 }, { r: 'LAB-MECH', units: 480 }] },
      { id: 'T1090', name: 'Internal Fit-Out L6-L35', wbs: 'TWR-N', start: 330, dur: 150, progress: 0, critical: false, float: 20, cost: 18600000, assign: [{ r: 'LAB-MASN', units: 600 }, { r: 'LAB-PAINT', units: 450 }] },
      { id: 'T1100', name: 'Top Crown & Architectural', wbs: 'TWR-N', start: 380, dur: 40, progress: 0, critical: true, cost: 8400000, assign: [{ r: 'EQP-CRANE', units: 120 }, { r: 'LAB-STRU', units: 160 }] },
      { id: 'T1110', name: 'Testing, Commissioning & Handover', wbs: 'TWR-N', start: 420, dur: 30, progress: 0, critical: true, cost: 4800000, assign: [{ r: 'SUB-ELEC', units: 90 }, { r: 'SUB-HVAC', units: 60 }] },
      { id: 'T1120', name: 'Milestone: Practical Completion', wbs: 'TWR-N', start: 450, dur: 0, progress: 0, critical: true, type: 'Finish Milestone', cost: 0, assign: [] },
    ],
    deps: [
      { from: 'T1000', to: 'T1010', type: 'FS' }, { from: 'T1010', to: 'T1020', type: 'FS' },
      { from: 'T1020', to: 'T1030', type: 'FS' }, { from: 'T1030', to: 'T1040', type: 'FS' },
      { from: 'T1040', to: 'T1050', type: 'FS' }, { from: 'T1050', to: 'T1060', type: 'FS' },
      { from: 'T1040', to: 'T1070', type: 'SS', lag: 20 }, { from: 'T1050', to: 'T1080', type: 'SS', lag: 15 },
      { from: 'T1070', to: 'T1090', type: 'FS' }, { from: 'T1080', to: 'T1090', type: 'FS' },
      { from: 'T1060', to: 'T1100', type: 'FS' }, { from: 'T1090', to: 'T1110', type: 'FS' },
      { from: 'T1100', to: 'T1110', type: 'FS' }, { from: 'T1110', to: 'T1120', type: 'FS' },
    ],
  }, 15)

  // Flagship project 3: Solar Farm
  await buildNetwork(projects[4], {
    code: 'SOL-1', name: 'Solar Farm 100MW — Phase 1', weight: 100, progress: 48, budget: 320000000, actual: 168000000,
    activities: [
      { id: 'S1000', name: 'Land Grading & Access Roads', wbs: 'SOL-1', start: 0, dur: 45, progress: 100, critical: true, cost: 8200000, assign: [{ r: 'EQP-EXC', units: 360 }, { r: 'EQP-DOZER', units: 270 }, { r: 'VEH-TRUCK', units: 540 }] },
      { id: 'S1010', name: 'Site Fencing & Security', wbs: 'SOL-1', start: 30, dur: 25, progress: 100, critical: false, float: 15, cost: 2400000, assign: [{ r: 'LAB-MASN', units: 150 }] },
      { id: 'S1020', name: 'Substation Civil Works', wbs: 'SOL-1', start: 45, dur: 60, progress: 92, critical: true, cost: 18600000, assign: [{ r: 'LAB-CONC', units: 480 }, { r: 'LAB-STRU', units: 240 }, { r: 'EQP-CRANE', units: 180 }] },
      { id: 'S1030', name: 'Mounting Structure Piles — 24000No', wbs: 'SOL-1', start: 75, dur: 120, progress: 58, critical: true, cost: 42800000, assign: [{ r: 'EQP-EXC', units: 960 }, { r: 'LAB-STRU', units: 720 }, { r: 'MAT-STEEL', units: 860 }, { r: 'MAT-STLSEC', units: 1200 }] },
      { id: 'S1040', name: 'PV Module Installation — 280000No', wbs: 'SOL-1', start: 120, dur: 180, progress: 35, critical: true, cost: 96500000, assign: [{ r: 'LAB-ELEC', units: 1440 }, { r: 'LAB-STRU', units: 720 }, { r: 'VEH-TRANS', units: 360 }] },
      { id: 'S1050', name: 'Inverter Stations Install — 40No', wbs: 'SOL-1', start: 160, dur: 90, progress: 18, critical: true, cost: 38400000, assign: [{ r: 'SUB-ELEC', units: 360 }, { r: 'EQP-LIFT', units: 180 }] },
      { id: 'S1060', name: 'DC Cabling & Stringing', wbs: 'SOL-1', start: 180, dur: 140, progress: 12, critical: false, float: 20, cost: 28600000, assign: [{ r: 'LAB-ELEC', units: 1120 }, { r: 'SUB-ELEC', units: 280 }] },
      { id: 'S1070', name: 'AC Cabling to Substation', wbs: 'SOL-1', start: 220, dur: 80, progress: 8, critical: true, cost: 18400000, assign: [{ r: 'LAB-ELEC', units: 640 }] },
      { id: 'S1080', name: 'SCADA & Monitoring System', wbs: 'SOL-1', start: 280, dur: 50, progress: 0, critical: true, cost: 8600000, assign: [{ r: 'SUB-ELEC', units: 200 }] },
      { id: 'S1090', name: 'Grid Connection & Sync Test', wbs: 'SOL-1', start: 330, dur: 30, progress: 0, critical: true, cost: 6400000, assign: [{ r: 'SUB-ELEC', units: 120 }] },
      { id: 'S1100', name: 'Performance Testing & Commissioning', wbs: 'SOL-1', start: 360, dur: 35, progress: 0, critical: true, cost: 4200000, assign: [{ r: 'SUB-ELEC', units: 140 }, { r: 'LAB-SURV', units: 70 }] },
      { id: 'S1110', name: 'Milestone: Grid Export Ready', wbs: 'SOL-1', start: 395, dur: 0, progress: 0, critical: true, type: 'Finish Milestone', cost: 0, assign: [] },
    ],
    deps: [
      { from: 'S1000', to: 'S1020', type: 'FS' }, { from: 'S1000', to: 'S1010', type: 'FS' },
      { from: 'S1020', to: 'S1030', type: 'FS' }, { from: 'S1030', to: 'S1040', type: 'SS', lag: 20 },
      { from: 'S1030', to: 'S1050', type: 'FS' }, { from: 'S1040', to: 'S1060', type: 'SS', lag: 15 },
      { from: 'S1050', to: 'S1070', type: 'FS' }, { from: 'S1060', to: 'S1080', type: 'FS' },
      { from: 'S1070', to: 'S1080', type: 'FS' }, { from: 'S1080', to: 'S1090', type: 'FS' },
      { from: 'S1090', to: 'S1100', type: 'FS' }, { from: 'S1100', to: 'S1110', type: 'FS' },
    ],
  }, 20)

  // For remaining projects, create a compact WBS + activity set
  const compactTemplate = (offset: number, scale: number) => ({
    code: 'ROOT', name: 'Project Root', weight: 100, progress: 30, budget: 10000000 * scale, actual: 3000000 * scale,
    activities: [
      { id: 'C1000', name: 'Mobilisation & Site Setup', wbs: 'ROOT', start: 0, dur: 14, progress: 100, critical: true, cost: 800000 * scale, assign: [{ r: 'LAB-SURV', units: 60 }, { r: 'EQP-EXC', units: 14 }] },
      { id: 'C1010', name: 'Substructure & Earthworks', wbs: 'ROOT', start: 14, dur: 40, progress: 80, critical: true, cost: 2400000 * scale, assign: [{ r: 'EQP-EXC', units: 200 }, { r: 'LAB-CONC', units: 180 }] },
      { id: 'C1020', name: 'Superstructure Works', wbs: 'ROOT', start: 54, dur: 80, progress: 45, critical: true, cost: 3800000 * scale, assign: [{ r: 'LAB-STRU', units: 360 }, { r: 'EQP-CRANE', units: 240 }] },
      { id: 'C1030', name: 'MEP Installation', wbs: 'ROOT', start: 90, dur: 70, progress: 18, critical: false, float: 12, cost: 2600000 * scale, assign: [{ r: 'SUB-ELEC', units: 200 }, { r: 'SUB-HVAC', units: 140 }] },
      { id: 'C1040', name: 'Finishes & Handover', wbs: 'ROOT', start: 160, dur: 50, progress: 0, critical: true, cost: 1800000 * scale, assign: [{ r: 'LAB-MASN', units: 200 }, { r: 'LAB-PAINT', units: 150 }] },
      { id: 'C1050', name: 'Milestone: Handover', wbs: 'ROOT', start: 210, dur: 0, progress: 0, critical: true, type: 'Finish Milestone', cost: 0, assign: [] },
    ],
    deps: [
      { from: 'C1000', to: 'C1010', type: 'FS' }, { from: 'C1010', to: 'C1020', type: 'FS' },
      { from: 'C1020', to: 'C1030', type: 'SS', lag: 10 }, { from: 'C1020', to: 'C1040', type: 'FS' },
      { from: 'C1030', to: 'C1040', type: 'FS' }, { from: 'C1040', to: 'C1050', type: 'FS' },
    ],
  })
  const offsets = [30, 40, 50, 60, 70, 90, 120, 45]
  for (let i = 3; i < projects.length; i++) {
    if (i === 4) continue // solar already done
    await buildNetwork(projects[i], compactTemplate(offsets[i] ?? 30, (i % 3) + 1), offsets[i] ?? 30)
  }

  // ---------- RISKS ----------
  const riskDefs = [
    ['PRJ-METRO-STA-A', 'TBM cutter head wear exceeds forecast', 'Schedule', 4, 5, 'Open', 'Mitigate', 'Procure spare cutter kits; rotate crews', 'Raj Patel', 850000],
    ['PRJ-METRO-STA-A', 'Ground settlement near heritage building', 'Technical', 3, 5, 'Mitigated', 'Mitigate', 'Install compensation grouting; monitoring', 'Ahmed Hassan', 1200000],
    ['PRJ-METRO-TUN', 'Differing ground conditions — boulders', 'Technical', 5, 4, 'Open', 'Mitigate', 'Probe ahead; adjust TBM parameters', 'Chen Wei', 2100000],
    ['PRJ-TWR-NORTH', 'Curtain wall delivery delay from overseas', 'Schedule', 4, 4, 'Open', 'Mitigate', 'Split shipments; air-freight critical panels', 'Maria Santos', 640000],
    ['PRJ-TWR-NORTH', 'Crane boom clearance with adjacent airspace', 'External', 2, 4, 'Mitigated', 'Accept', 'Aviation authority NOC obtained', 'Maria Santos', 50000],
    ['PRJ-SOLAR-100MW', 'PV module price escalation (tariff)', 'Cost', 4, 5, 'Open', 'Transfer', 'Lock supply agreement; hedge FX', 'Ahmed Hassan', 3400000],
    ['PRJ-SOLAR-100MW', 'Grid connection slot delay by utility', 'External', 5, 5, 'Open', 'Mitigate', 'Early engagement; parallel approvals', 'Ahmed Hassan', 1800000],
    ['PRJ-SOLAR-100MW', 'Sandstorm season productivity loss', 'External', 4, 3, 'Open', 'Accept', 'Adjust crew shifts; protective measures', 'Ahmed Hassan', 420000],
    ['PRJ-BRIDGE-RIV', 'River scour around pier foundation', 'Technical', 3, 5, 'Open', 'Mitigate', 'Scour monitoring; rip-rap protection', 'Raj Patel', 720000],
    ['PRJ-HOSP-300', 'Medical equipment long-lead procurement', 'Schedule', 4, 4, 'Open', 'Mitigate', 'Order against advance; vendor holding', 'Maria Santos', 950000],
    ['PRJ-WTP-NEW', 'Membrane supplier capacity constraint', 'Resource', 3, 4, 'Open', 'Mitigate', 'Dual-source qualification', 'Ahmed Hassan', 560000],
    ['PRJ-PORT-EXP', 'Environmental permit approval risk', 'External', 4, 5, 'Open', 'Mitigate', 'EIA early submission; stakeholder plan', 'Ahmed Hassan', 320000],
    ['PRJ-MALL-LUX', 'Tenant fit-out coordination clash', 'Schedule', 3, 3, 'Mitigated', 'Mitigate', 'BIM clash detection; phased handover', 'Maria Santos', 180000],
    ['PRJ-SCHOOL-12', 'Multiple site weather exposure', 'External', 4, 3, 'Open', 'Accept', 'Buffer in schedule; tented works', 'Maria Santos', 240000],
  ]
  const projByCode = Object.fromEntries(projects.map(p => [p.code, p]))
  await db.$transaction(
    riskDefs.map((r, i) => db.risk.create({ data: {
      code: `RSK-${String(i + 1).padStart(4, '0')}`,
      title: r[1], projectId: projByCode[r[0] as string].id, category: r[2] as string,
      probability: r[3] as number, impact: r[4] as number, score: (r[3] as number) * (r[4] as number),
      status: r[5] as string, strategy: r[6] as string, mitigation: r[7] as string, owner: r[8] as string,
      responseCost: r[9] as number, raisedDate: D(i * 5), dueDate: D(i * 5 + 60),
    }}))
  )
  console.log(`  ✓ ${riskDefs.length} risks`)

  // ---------- BASELINES ----------
  await db.$transaction([
    db.baseline.create({ data: { name: 'Baseline 1 — Original Schedule', projectId: projects[0].id, type: 'Primary', isCurrent: false, startDate: D(0), finishDate: D(400), budget: 95000000, duration: 320, createdBy: 'Chen Wei' }}),
    db.baseline.create({ data: { name: 'Baseline 2 — Recovery Rev 2', projectId: projects[0].id, type: 'Project', isCurrent: true, startDate: D(0), finishDate: D(420), budget: 97200000, duration: 340, createdBy: 'Chen Wei' }}),
    db.baseline.create({ data: { name: 'Baseline 1 — Contractual', projectId: projects[2].id, type: 'Primary', isCurrent: true, startDate: D(15), finishDate: D(550), budget: 185000000, duration: 435, createdBy: 'Raj Patel' }}),
    db.baseline.create({ data: { name: 'Baseline 1 — Contractual', projectId: projects[4].id, type: 'Primary', isCurrent: false, startDate: D(10), finishDate: D(580), budget: 320000000, duration: 395, createdBy: 'Ahmed Hassan' }}),
    db.baseline.create({ data: { name: 'Baseline 2 — Rev 3 (delay)', projectId: projects[4].id, type: 'Project', isCurrent: true, startDate: D(20), finishDate: D(620), budget: 348000000, duration: 400, createdBy: 'Ahmed Hassan' }}),
    db.baseline.create({ data: { name: 'Baseline 1 — Contractual', projectId: projects[6].id, type: 'Primary', isCurrent: true, startDate: D(50), finishDate: D(670), budget: 210000000, duration: 620, createdBy: 'Raj Patel' }}),
  ])

  // ---------- CHANGE ORDERS ----------
  const changeDefs = [
    ['PRJ-METRO-STA-A', 'CO-001 Additional waterproofing specification', 'Variation', 'Approved', 850000, 12],
    ['PRJ-METRO-STA-A', 'CO-002 Wayfinding signage upgrade', 'Variation', 'Under Review', 320000, 0],
    ['PRJ-METRO-TUN', 'EOT-001 Geotech delay — boulder zone', 'EOT', 'Submitted', 0, 45],
    ['PRJ-TWR-NORTH', 'CO-003 Facade glass spec change', 'Variation', 'Approved', 1240000, 8],
    ['PRJ-TWR-NORTH', 'CO-004 Added sky-garden level', 'Variation', 'Under Review', 2850000, 20],
    ['PRJ-SOLAR-100MW', 'CLM-001 Module tariff surcharge claim', 'Claim', 'Submitted', 3400000, 0],
    ['PRJ-SOLAR-100MW', 'EOT-002 Grid connection slot delay', 'EOT', 'Submitted', 0, 60],
    ['PRJ-HOSP-300', 'CO-005 MRI suite shielding upgrade', 'Variation', 'Approved', 680000, 5],
    ['PRJ-BRIDGE-RIV', 'EOT-003 Pier scour remediation', 'EOT', 'Approved', 720000, 25],
    ['PRJ-WTP-NEW', 'CO-006 Membrane capacity increase', 'Variation', 'Under Review', 1450000, 14],
  ]
  await db.$transaction(
    changeDefs.map((c, i) => db.changeOrder.create({ data: {
      code: c[0].split('-').slice(0, 2).join('-') + '-CHG-' + String(i + 1).padStart(3, '0'),
      title: c[1] as string, projectId: projByCode[c[0] as string].id, type: c[2] as string,
      status: c[3] as string, costImpact: c[4] as number, timeImpact: c[5] as number,
      raisedBy: 'Site Engineer', raisedDate: D(i * 8),
    }}))
  )

  // ---------- DOCUMENTS ----------
  const docDefs = [
    ['PRJ-METRO-STA-A', 'ARCH-DR-101 Station Architectural Layout', 'Drawing', 'Approved', '3.1'],
    ['PRJ-METRO-STA-A', 'STR-DR-205 Diaphragm Wall Reinforcement', 'Drawing', 'Approved', '2.0'],
    ['PRJ-METRO-STA-A', 'MS-001 Excavation Method Statement', 'Method Statement', 'Approved', '1.2'],
    ['PRJ-METRO-STA-A', 'RFI-018 Waterproofing detail at slab junction', 'RFI', 'Under Review', '1.0'],
    ['PRJ-TWR-NORTH', 'ARCH-DR-301 Tower Typical Floor Plan', 'Drawing', 'Approved', '4.0'],
    ['PRJ-TWR-NORTH', 'FAC-DR-110 Curtain Wall Shop Drawing', 'Drawing', 'Under Review', '1.1'],
    ['PRJ-TWR-NORTH', 'SUB-052 Facade Material Submittal', 'Submittal', 'Approved', '2.0'],
    ['PRJ-SOLAR-100MW', 'ELEC-DR-410 DC Stringing Layout', 'Drawing', 'Approved', '2.1'],
    ['PRJ-SOLAR-100MW', 'SPEC-PV01 PV Module Technical Spec', 'Spec', 'Approved', '1.0'],
    ['PRJ-SOLAR-100MW', 'RFI-027 Inverter pad location clarification', 'RFI', 'Submitted', '1.0'],
    ['PRJ-HOSP-300', 'ARCH-DR-501 Theatre Block Layout', 'Drawing', 'Approved', '3.0'],
    ['PRJ-HOSP-300', 'MS-004 Infection Control Method Statement', 'Method Statement', 'Under Review', '1.0'],
  ]
  await db.$transaction(
    docDefs.map((d, i) => db.document.create({ data: {
      name: d[1] as string, projectId: projByCode[d[0] as string].id, type: d[2] as string,
      version: d[4] as string, status: d[3] as string, uploadedBy: 'Planning', fileUrl: null,
    }}))
  )

  // ---------- DAILY REPORTS ----------
  const today = Math.floor((Date.now() - Date.UTC(2025, 9, 15)) / day)
  for (let p = 0; p < projects.length; p++) {
    for (let d = 0; d < 6; d++) {
      const dayOff = today - d
      await db.dailyReport.create({ data: {
        projectId: projects[p].id, reportDate: D(dayOff),
        weather: ['Clear 32°C', 'Sunny 30°C', 'Overcast 28°C', 'Light rain 26°C', 'Hot 35°C'][d % 5],
        manpower: 40 + Math.floor(Math.random() * 180),
        progress: 'Substructure works progressing per programme',
        notes: 'Concrete pour completed on L3; MEP first-fix ongoing',
        delays: d === 3 ? 'Crane downtime 2.5h (maintenance)' : 'Nil',
        supervisor: ['Tom Wilson', 'Chen Wei', 'Lisa Brown'][p % 3],
      }})
    }
  }
  console.log(`  ✓ baselines, changes, documents, daily reports`)

  console.log('🌱 Seed complete.')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => db.$disconnect())

import { db } from '@/lib/db'

function daysAgo(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(0, 0, 0, 0)
  return d
}

function daysFromNow(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(0, 0, 0, 0)
  return d
}

function daysFromNowTime(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d
}

async function main() {
  console.log('🌱 Seeding SMARTBUILD Collaboration Module...')

  // Find project: try specific ID first, then fallback to first active project
  let project = await db.project.findUnique({
    where: { id: 'cmqb07i1z0001pknyu09vgl60' },
  })
  if (!project) {
    project = await db.project.findFirst({ where: { status: 'active' } })
  }
  if (!project) {
    console.error('❌ No active project found. Please seed base data first.')
    process.exit(1)
  }
  console.log(`📐 Using project: ${project.name} (${project.id})`)

  // Find users for references
  const adminUser = await db.user.findFirst({ where: { role: 'admin' } })
  const supervisorUser = await db.user.findFirst({ where: { role: 'supervisor' } })
  const accountantUser = await db.user.findFirst({ where: { role: 'accountant' } })
  const storeManagerUser = await db.user.findFirst({ where: { role: 'store_manager' } })
  const clientUser = await db.user.findFirst({ where: { role: 'client' } })

  if (!adminUser || !supervisorUser) {
    console.error('❌ Required users not found. Please seed base data first.')
    process.exit(1)
  }

  const adminId = adminUser.id
  const supervisorId = supervisorUser.id
  const accountantId = accountantUser?.id || adminId
  const storeManagerId = storeManagerUser?.id || adminId
  const clientId = clientUser?.id || adminId

  const pid = project.id

  // ============ PROJECT TEAM MEMBERS ============
  console.log('👥 Creating project team members...')
  try {
    const existingTeam = await db.projectTeamMember.findMany({ where: { projectId: pid } })
    if (existingTeam.length === 0) {
      await db.projectTeamMember.createMany({
        data: [
          {
            projectId: pid,
            name: 'Vikram Malhotra',
            role: 'owner',
            company: 'Skyline Developers Pvt Ltd',
            phone: '+91 98100 12345',
            email: 'vikram@skylinedevelopers.com',
            isActive: true,
          },
          {
            projectId: pid,
            name: 'Rajesh Kumar',
            role: 'project_manager',
            company: 'Skyline Developers Pvt Ltd',
            phone: '+91 98765 43211',
            email: 'rajesh@smartbuild.com',
            isActive: true,
          },
          {
            projectId: pid,
            name: 'Arjun Nair',
            role: 'site_engineer',
            company: 'SmartBuild Constructions',
            phone: '+91 99880 56789',
            email: 'arjun.nair@smartbuild.com',
            isActive: true,
          },
          {
            projectId: pid,
            name: 'Suresh Reddy',
            role: 'supervisor',
            company: 'SmartBuild Constructions',
            phone: '+91 98765 43214',
            email: 'suresh@smartbuild.com',
            isActive: true,
          },
          {
            projectId: pid,
            name: 'Dr. Kavitha Rao',
            role: 'consultant',
            company: 'Rao Structural Consultants',
            phone: '+91 94480 34567',
            email: 'kavitha@raoconsultants.com',
            isActive: true,
          },
        ],
      })
      console.log('  ✅ 5 team members created')
    } else {
      console.log('  ⏭️  Team members already exist, skipping')
    }
  } catch (error: any) {
    console.log(`  ⚠️  Team members error: ${error.message}`)
  }

  // ============ OPEN ITEMS ============
  console.log('📋 Creating open items...')
  try {
    const existingOI = await db.openItem.findMany({ where: { projectId: pid } })
    if (existingOI.length === 0) {
      await db.openItem.createMany({
        data: [
          {
            projectId: pid,
            itemNo: 'OI-001',
            title: 'Clarification on foundation bolt spacing',
            description: 'Structural drawings show 200mm c/c but site condition requires 150mm. Need approval for modification.',
            category: 'rfi',
            priority: 'high',
            status: 'open',
            assignedTo: 'Dr. Kavitha Rao',
            dueDate: daysFromNow(3),
            createdById: supervisorId,
          },
          {
            projectId: pid,
            itemNo: 'OI-002',
            title: 'Water seepage in basement level B2',
            description: 'During excavation, water seepage observed at gridline A-B. Need dewatering plan before proceeding.',
            category: 'site_issue',
            priority: 'critical',
            status: 'in_review',
            assignedTo: 'Arjun Nair',
            dueDate: daysAgo(2),
            createdById: supervisorId,
          },
          {
            projectId: pid,
            itemNo: 'OI-003',
            title: 'Missing edge protection on 7th floor slab',
            description: 'Workers observed working near unprotected edges on 7th floor. Immediate safety barriers required.',
            category: 'safety_issue',
            priority: 'critical',
            status: 'pending',
            assignedTo: 'Suresh Reddy',
            dueDate: daysFromNow(0),
            createdById: adminId,
          },
          {
            projectId: pid,
            itemNo: 'OI-004',
            title: 'Request for additional 50 tons of TMT Fe-500D bars',
            description: 'Design revision requires additional reinforcement. Current stock insufficient for upcoming slab work.',
            category: 'material_request',
            priority: 'high',
            status: 'open',
            assignedTo: 'Suresh Reddy',
            dueDate: daysFromNow(7),
            createdById: storeManagerId,
          },
          {
            projectId: pid,
            itemNo: 'OI-005',
            title: 'Client requests upgraded lobby flooring',
            description: 'Client has requested to upgrade from vitrified tiles to Italian marble for the main lobby. Cost impact to be assessed.',
            category: 'client_request',
            priority: 'medium',
            status: 'open',
            assignedTo: 'Rajesh Kumar',
            dueDate: daysFromNow(14),
            createdById: adminId,
          },
          {
            projectId: pid,
            itemNo: 'OI-006',
            title: 'Approval for revised structural steel connection',
            description: 'Connection design at level 12 beam-column joint needs consultant approval after site constraint modification.',
            category: 'approval_required',
            priority: 'high',
            status: 'in_review',
            assignedTo: 'Dr. Kavitha Rao',
            dueDate: daysFromNow(5),
            createdById: supervisorId,
          },
          {
            projectId: pid,
            itemNo: 'OI-007',
            title: 'Change in MEP duct routing due to beam clash',
            description: 'HVAC duct routing conflicts with structural beam at grid C-5 to C-7. Rerouting required with additional supports.',
            category: 'change_request',
            priority: 'medium',
            status: 'open',
            assignedTo: 'Arjun Nair',
            dueDate: daysFromNow(10),
            createdById: supervisorId,
          },
          {
            projectId: pid,
            itemNo: 'OI-008',
            title: 'Delay in cement delivery from primary supplier',
            description: 'UltraTech has informed 3-day delay in cement supply. Need to arrange alternate supplier or adjust pour schedule.',
            category: 'material_request',
            priority: 'high',
            status: 'resolved',
            assignedTo: 'Suresh Reddy',
            dueDate: daysAgo(1),
            resolvedDate: daysAgo(1),
            resolvedById: storeManagerId,
            createdById: supervisorId,
          },
        ],
      })
      console.log('  ✅ 8 open items created')
    } else {
      console.log('  ⏭️  Open items already exist, skipping')
    }
  } catch (error: any) {
    console.log(`  ⚠️  Open items error: ${error.message}`)
  }

  // ============ RFIs ============
  console.log('📝 Creating RFIs...')
  let rfi1Id = ''
  let rfi2Id = ''
  try {
    const existingRFIs = await db.rFI.findMany({ where: { projectId: pid } })
    if (existingRFIs.length === 0) {
      const rfi1 = await db.rFI.create({
        data: {
          projectId: pid,
          rfiNo: 'RFI-001',
          title: 'Foundation Bolt Spacing Clarification',
          description: 'As per structural drawing SKY-T1-STR-003, the anchor bolt spacing for base plates at column C1-C5 is shown as 200mm c/c. However, due to the existing rock strata encountered during excavation, the pedestal size needs to be reduced. We propose changing the bolt spacing to 150mm c/c with Grade 8.8 bolts. Please confirm structural adequacy.',
          category: 'technical',
          priority: 'high',
          status: 'submitted',
          submittedById: supervisorId,
          assignedTo: 'Dr. Kavitha Rao',
          dueDate: daysFromNow(5),
        },
      })
      rfi1Id = rfi1.id

      const rfi2 = await db.rFI.create({
        data: {
          projectId: pid,
          rfiNo: 'RFI-002',
          title: 'Concrete Mix Design for Pumped Concrete',
          description: 'For the 12th floor slab pour (approx 180 cum), we need approval for M40 grade pumped concrete with fly ash replacement. Proposed mix: OPC 53 - 350 kg, Fly Ash - 90 kg, W/C ratio 0.42, Admixture - 1.2% by weight of cement. Please review and approve.',
          category: 'technical',
          priority: 'medium',
          status: 'under_review',
          submittedById: supervisorId,
          assignedTo: 'Dr. Kavitha Rao',
          dueDate: daysFromNow(7),
        },
      })
      rfi2Id = rfi2.id

      await db.rFI.create({
        data: {
          projectId: pid,
          rfiNo: 'RFI-003',
          title: 'Payment Milestone Clarification for Structural Work',
          description: 'The contract mentions "completion of structural frame up to 10th floor" as Milestone 3. We are at 9th floor slab completion. The client wants to include 9th floor columns in the current milestone. Need written confirmation from client representative.',
          category: 'commercial',
          priority: 'high',
          status: 'answered',
          submittedById: accountantId,
          assignedTo: 'Vikram Malhotra',
          dueDate: daysAgo(5),
          answeredById: clientId,
          answeredAt: daysAgo(3),
        },
      })

      await db.rFI.create({
        data: {
          projectId: pid,
          rfiNo: 'RFI-004',
          title: 'Fire Escape Staircase Width - Code Compliance',
          description: 'Draft question regarding the required width of fire escape staircase as per NBC 2016. Current design shows 1.2m width but occupancy calculations suggest 1.5m may be required. Seeking clarification before proceeding with architectural drawings.',
          category: 'design',
          priority: 'medium',
          status: 'draft',
          submittedById: supervisorId,
        },
      })
      console.log('  ✅ 4 RFIs created')
    } else {
      console.log('  ⏭️  RFIs already exist, skipping')
      // Still need IDs for comments
      const rfiForComments = await db.rFI.findFirst({
        where: { projectId: pid, status: { in: ['submitted', 'under_review'] } },
      })
      if (rfiForComments) {
        rfi1Id = rfiForComments.id
      }
    }
  } catch (error: any) {
    console.log(`  ⚠️  RFIs error: ${error.message}`)
  }

  // ============ RFI COMMENTS ============
  console.log('💬 Creating RFI comments...')
  try {
    if (rfi1Id) {
      const existingComments = await db.rFIComment.findMany({ where: { rfiId: rfi1Id } })
      if (existingComments.length === 0) {
        await db.rFIComment.createMany({
          data: [
            {
              rfiId: rfi1Id,
              userId: supervisorId,
              content: 'We have also checked with the steel fabricator - they can accommodate 150mm c/c spacing with standard base plate modifications. The additional cost for Grade 8.8 bolts is approximately ₹45,000 for all base plates at this level.',
            },
            {
              rfiId: rfi1Id,
              userId: adminId,
              content: 'Please also provide a revised anchor bolt schedule and the calculation sheet for the revised connection. We need this for our records and future reference during QC inspection.',
            },
          ],
        })
        console.log('  ✅ 2 RFI comments created')
      } else {
        console.log('  ⏭️  RFI comments already exist, skipping')
      }
    }
  } catch (error: any) {
    console.log(`  ⚠️  RFI comments error: ${error.message}`)
  }

  // ============ CHANGE EVENTS ============
  console.log('🔄 Creating change events...')
  let ce1Id = ''
  let ce2Id = ''
  try {
    const existingCE = await db.changeEvent.findMany({ where: { projectId: pid } })
    if (existingCE.length === 0) {
      const ce1 = await db.changeEvent.create({
        data: {
          projectId: pid,
          eventNo: 'CE-001',
          title: 'Additional Waterproofing in Basement',
          description: 'Due to high water table encountered during excavation, additional waterproofing treatment required for basement walls and raft. Includes crystalline waterproofing additive and additional membrane layers.',
          category: 'scope',
          impactType: 'cost',
          potentialCostImpact: 2850000,
          potentialScheduleImpact: '12 days',
          status: 'approved',
          submittedById: supervisorId,
          reviewedById: accountantId,
          approvedById: adminId,
        },
      })
      ce1Id = ce1.id

      const ce2 = await db.changeEvent.create({
        data: {
          projectId: pid,
          eventNo: 'CE-002',
          title: 'Upgraded MEP Specifications',
          description: 'Client requested upgrade from standard split AC to VRV system for floors 1-5. This affects duct routing, electrical load, and structural provisions for AHU units.',
          category: 'scope',
          impactType: 'cost',
          potentialCostImpact: 12500000,
          potentialScheduleImpact: '21 days',
          status: 'review',
          submittedById: supervisorId,
          reviewedById: accountantId,
        },
      })
      ce2Id = ce2.id

      const ce3 = await db.changeEvent.create({
        data: {
          projectId: pid,
          eventNo: 'CE-003',
          title: 'Revised Excavation Method - Rock Blasting',
          description: 'Hard rock encountered below 8m depth requiring controlled blasting instead of mechanical excavation. Need specialized contractor and additional safety measures.',
          category: 'schedule',
          impactType: 'schedule',
          potentialCostImpact: 4200000,
          potentialScheduleImpact: '28 days',
          status: 'open',
          submittedById: supervisorId,
        },
      })

      console.log('  ✅ 3 change events created')
    } else {
      console.log('  ⏭️  Change events already exist, skipping')
      const ceForCO = await db.changeEvent.findMany({
        where: { projectId: pid, status: { in: ['approved', 'review'] } },
        take: 2,
      })
      if (ceForCO.length >= 1) ce1Id = ceForCO[0].id
      if (ceForCO.length >= 2) ce2Id = ceForCO[1].id
    }
  } catch (error: any) {
    console.log(`  ⚠️  Change events error: ${error.message}`)
  }

  // ============ CHANGE ORDERS ============
  console.log('📋 Creating change orders...')
  try {
    const existingCO = await db.changeOrder.findMany({ where: { projectId: pid } })
    if (existingCO.length === 0) {
      await db.changeOrder.create({
        data: {
          projectId: pid,
          changeEventId: ce1Id || undefined,
          coNo: 'CO-001',
          title: 'Change Order - Basement Waterproofing',
          description: 'Approved change order for additional waterproofing in B1 and B2 levels. Includes crystalline waterproofing, additional membrane, and drainage provisions.',
          costAdjustment: 2850000,
          timeAdjustment: '12 days',
          originalBudget: 150000000,
          adjustedBudget: 152850000,
          status: 'approved',
          submittedById: accountantId,
          approvedById: adminId,
        },
      })

      await db.changeOrder.create({
        data: {
          projectId: pid,
          changeEventId: ce2Id || undefined,
          coNo: 'CO-002',
          title: 'Change Order - VRV System Upgrade',
          description: 'Change order for upgrading HVAC system from split AC to VRV for floors 1-5. Pending final client approval on cost sharing.',
          costAdjustment: 12500000,
          timeAdjustment: '21 days',
          originalBudget: 152850000,
          adjustedBudget: 165350000,
          status: 'submitted',
          submittedById: accountantId,
        },
      })

      console.log('  ✅ 2 change orders created')
    } else {
      console.log('  ⏭️  Change orders already exist, skipping')
    }
  } catch (error: any) {
    console.log(`  ⚠️  Change orders error: ${error.message}`)
  }

  // ============ PROJECT COMMITMENTS ============
  console.log('📦 Creating project commitments...')
  try {
    const existingCommitments = await db.projectCommitment.findMany({ where: { projectId: pid } })
    if (existingCommitments.length === 0) {
      await db.projectCommitment.createMany({
        data: [
          {
            projectId: pid,
            type: 'purchase_order',
            vendor: 'UltraTech Cement Ltd',
            description: 'Supply of OPC 53 Grade Cement - 5000 MT over 6 months',
            contractValue: 37500000,
            committedCost: 22500000,
            remainingCost: 15000000,
            status: 'active',
            startDate: daysAgo(60),
            endDate: daysFromNow(120),
          },
          {
            projectId: pid,
            type: 'subcontract',
            vendor: 'Krishna Earthworks Pvt Ltd',
            description: 'Excavation, earthwork, and foundation for basement B1-B2 levels',
            contractValue: 18500000,
            committedCost: 14200000,
            remainingCost: 4300000,
            status: 'active',
            startDate: daysAgo(75),
            endDate: daysFromNow(15),
          },
          {
            projectId: pid,
            type: 'material_order',
            vendor: 'Tata Steel Distributors',
            description: 'TMT Fe-500D rebars - 1200 MT as per bar bending schedule',
            contractValue: 78000000,
            committedCost: 52000000,
            remainingCost: 26000000,
            status: 'active',
            startDate: daysAgo(45),
            endDate: daysFromNow(150),
          },
          {
            projectId: pid,
            type: 'labour_contract',
            vendor: 'SkillBuild Manpower Solutions',
            description: 'Skilled and unskilled labour supply for structural work - 200 workers',
            contractValue: 24000000,
            committedCost: 16000000,
            remainingCost: 8000000,
            status: 'active',
            startDate: daysAgo(60),
            endDate: daysFromNow(180),
          },
        ],
      })
      console.log('  ✅ 4 project commitments created')
    } else {
      console.log('  ⏭️  Project commitments already exist, skipping')
    }
  } catch (error: any) {
    console.log(`  ⚠️  Project commitments error: ${error.message}`)
  }

  // ============ DIRECT COSTS ============
  console.log('💰 Creating direct costs...')
  try {
    const existingDC = await db.directCost.findMany({ where: { projectId: pid } })
    if (existingDC.length === 0) {
      await db.directCost.createMany({
        data: [
          {
            projectId: pid,
            category: 'equipment',
            description: 'Tower crane rental - POTAIN MC 125 (month of May)',
            amount: 850000,
            date: daysAgo(15),
            approvedById: adminId,
            status: 'approved',
            createdById: supervisorId,
          },
          {
            projectId: pid,
            category: 'materials',
            description: 'Formwork plywood purchase - 200 sheets 18mm commercial',
            amount: 720000,
            date: daysAgo(10),
            approvedById: adminId,
            status: 'approved',
            createdById: storeManagerId,
          },
          {
            projectId: pid,
            category: 'fuel',
            description: 'DG set fuel - 2000 liters diesel for site power backup',
            amount: 188000,
            date: daysAgo(5),
            approvedById: adminId,
            status: 'approved',
            createdById: supervisorId,
          },
          {
            projectId: pid,
            category: 'transportation',
            description: 'Muck disposal - 120 trips to designated landfill site',
            amount: 960000,
            date: daysAgo(8),
            approvedById: adminId,
            status: 'pending',
            createdById: supervisorId,
          },
          {
            projectId: pid,
            category: 'accommodation',
            description: 'Labour camp rent and utilities for June 2025',
            amount: 450000,
            date: daysAgo(2),
            approvedById: supervisorId,
            status: 'pending',
            createdById: supervisorId,
          },
          {
            projectId: pid,
            category: 'miscellaneous',
            description: 'PPE procurement - helmets, safety shoes, harnesses for new workers',
            amount: 185000,
            date: daysAgo(3),
            approvedById: adminId,
            status: 'approved',
            createdById: storeManagerId,
          },
        ],
      })
      console.log('  ✅ 6 direct costs created')
    } else {
      console.log('  ⏭️  Direct costs already exist, skipping')
    }
  } catch (error: any) {
    console.log(`  ⚠️  Direct costs error: ${error.message}`)
  }

  // ============ PRIME CONTRACT ============
  console.log('📄 Creating prime contract...')
  try {
    const existingPC = await db.primeContract.findUnique({ where: { projectId: pid } })
    if (!existingPC) {
      await db.primeContract.create({
        data: {
          projectId: pid,
          contractNo: 'SC-2025-001',
          client: 'Skyline Developers Pvt Ltd',
          originalValue: 150000000,
          variationOrders: 2850000,
          retention: 5,
          claims: 0,
          status: 'active',
          startDate: daysAgo(90),
          endDate: daysFromNow(180),
        },
      })
      console.log('  ✅ 1 prime contract created')
    } else {
      console.log('  ⏭️  Prime contract already exists, skipping')
    }
  } catch (error: any) {
    console.log(`  ⚠️  Prime contract error: ${error.message}`)
  }

  // ============ PROJECT COMMENTS ============
  console.log('💬 Creating project comments...')
  try {
    const existingComments = await db.projectComment.findMany({ where: { projectId: pid } })
    if (existingComments.length === 0) {
      // Get entity IDs for attaching comments
      const firstOI = await db.openItem.findFirst({ where: { projectId: pid } })
      const firstRFI = await db.rFI.findFirst({ where: { projectId: pid } })

      await db.projectComment.createMany({
        data: [
          {
            projectId: pid,
            userId: adminId,
            entityType: 'general',
            entityId: null,
            content: 'Team meeting scheduled for Friday 3 PM to discuss upcoming slab pour sequence and resource allocation for next month.',
            mentions: JSON.stringify([supervisorId, accountantId]),
          },
          {
            projectId: pid,
            userId: supervisorId,
            entityType: 'general',
            entityId: null,
            content: 'Concrete cube test results for 8th floor columns received - all 3 samples passed with average strength of 46.2 MPa against required 40 MPa. QC team to file report.',
          },
          {
            projectId: pid,
            userId: accountantId,
            entityType: 'change_order',
            entityId: firstOI?.id || null,
            content: 'Budget impact of approved change orders has been updated in the financial dashboard. Total approved variations now stand at ₹28.5 Lakhs.',
          },
          {
            projectId: pid,
            userId: supervisorId,
            entityType: 'rfi',
            entityId: firstRFI?.id || null,
            content: 'Following up on RFI response. The steel fabrication is on hold pending this clarification. Fabricator needs confirmation by EOD Thursday to maintain schedule.',
          },
          {
            projectId: pid,
            userId: adminId,
            entityType: 'general',
            entityId: null,
            content: 'Safety audit completed. Overall rating: Satisfactory. Two minor observations noted - PPE compliance at east wing and housekeeping near material storage. Corrective actions assigned.',
            mentions: JSON.stringify([supervisorId]),
          },
        ],
      })
      console.log('  ✅ 5 project comments created')
    } else {
      console.log('  ⏭️  Project comments already exist, skipping')
    }
  } catch (error: any) {
    console.log(`  ⚠️  Project comments error: ${error.message}`)
  }

  console.log('✅ Collaboration module seeding complete!')
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  })
  .finally(() => {
    db.$disconnect()
  })
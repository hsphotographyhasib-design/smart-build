import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

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

function today(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function startOfMonth(): Date {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

function monthsAgo(months: number): Date {
  const d = new Date()
  d.setMonth(d.getMonth() - months)
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

async function main() {
  console.log('🌱 Seeding SMARTBUILD Construction Management ERP...')

  // Clean up existing data (in correct order to respect FK constraints)
  console.log('🧹 Cleaning existing data...')
  await prisma.notificationPreference.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.assetIssue.deleteMany()
  await prisma.assetMaintenance.deleteMany()
  await prisma.asset.deleteMany()
  await prisma.milestonePayment.deleteMany()
  await prisma.workOrder.deleteMany()
  await prisma.subContractor.deleteMany()
  await prisma.loan.deleteMany()
  await prisma.leaveRequest.deleteMany()
  await prisma.employee.deleteMany()
  await prisma.advancePayment.deleteMany()
  await prisma.payroll.deleteMany()
  await prisma.attendance.deleteMany()
  await prisma.labour.deleteMany()
  await prisma.labourGroup.deleteMany()
  await prisma.salesInvoice.deleteMany()
  await prisma.salesQuotation.deleteMany()
  await prisma.product.deleteMany()
  await prisma.productCategory.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.purchaseOrderItem.deleteMany()
  await prisma.purchaseOrder.deleteMany()
  await prisma.purchaseRequestItem.deleteMany()
  await prisma.purchaseRequest.deleteMany()
  await prisma.stockMovement.deleteMany()
  await prisma.material.deleteMany()
  await prisma.supplier.deleteMany()
  await prisma.bOQItem.deleteMany()
  await prisma.bOQ.deleteMany()
  await prisma.invoiceItem.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.expense.deleteMany()
  await prisma.dailyNote.deleteMany()
  await prisma.projectTask.deleteMany()
  await prisma.projectMilestone.deleteMany()
  await prisma.projectDocument.deleteMany()
  await prisma.projectMember.deleteMany()
  await prisma.project.deleteMany()
  await prisma.session.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.user.deleteMany()

  // ============ USERS ============
  console.log('👤 Creating users...')
  const adminPassword = await hashPassword('admin123')
  const userPassword = await hashPassword('password123')

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@smartbuild.com',
      password: adminPassword,
      name: 'Admin User',
      phone: '+91 98765 43210',
      role: 'admin',
      isActive: true,
    },
  })

  const supervisorUser = await prisma.user.create({
    data: {
      email: 'supervisor@smartbuild.com',
      password: userPassword,
      name: 'Rajesh Kumar',
      phone: '+91 98765 43211',
      role: 'supervisor',
      isActive: true,
    },
  })

  const hrUser = await prisma.user.create({
    data: {
      email: 'hr@smartbuild.com',
      password: userPassword,
      name: 'Priya Sharma',
      phone: '+91 98765 43212',
      role: 'hr_manager',
      isActive: true,
    },
  })

  const accountantUser = await prisma.user.create({
    data: {
      email: 'accountant@smartbuild.com',
      password: userPassword,
      name: 'Amit Patel',
      phone: '+91 98765 43213',
      role: 'accountant',
      isActive: true,
    },
  })

  const storeManagerUser = await prisma.user.create({
    data: {
      email: 'store@smartbuild.com',
      password: userPassword,
      name: 'Suresh Reddy',
      phone: '+91 98765 43214',
      role: 'store_manager',
      isActive: true,
    },
  })

  const clientUser = await prisma.user.create({
    data: {
      email: 'client@smartbuild.com',
      password: userPassword,
      name: 'Mahesh Agarwal',
      phone: '+91 98765 43215',
      role: 'client',
      isActive: true,
    },
  })

  // ============ PROJECTS ============
  console.log('🏗️ Creating projects...')
  const project1 = await prisma.project.create({
    data: {
      name: 'Skyline Tower - Phase 1',
      code: 'PRJ-001',
      description: '20-storey commercial building with basement parking in Tech Park area',
      status: 'active',
      startDate: daysAgo(90),
      endDate: daysFromNow(180),
      budget: 150000000,
      address: 'Plot 45, Tech Park, Whitefield, Bangalore - 560066',
      progress: 35,
    },
  })

  const project2 = await prisma.project.create({
    data: {
      name: 'Green Valley Residences',
      code: 'PRJ-002',
      description: '48-unit premium residential apartment complex with amenities',
      status: 'active',
      startDate: daysAgo(150),
      endDate: daysFromNow(120),
      budget: 80000000,
      address: 'Survey No 12/3, Green Valley Layout, HSR Sector 7, Bangalore',
      progress: 60,
    },
  })

  const project3 = await prisma.project.create({
    data: {
      name: 'Metro Station Expansion',
      code: 'PRJ-003',
      description: 'Expansion of existing metro station with additional platforms and foot over bridge',
      status: 'planning',
      startDate: daysFromNow(30),
      endDate: daysFromNow(365),
      budget: 200000000,
      address: 'MG Road Metro Station, Bangalore - 560001',
      progress: 0,
    },
  })

  // ============ PROJECT MEMBERS ============
  console.log('👥 Adding project members...')
  await prisma.projectMember.createMany({
    data: [
      { projectId: project1.id, userId: supervisorUser.id, role: 'supervisor' },
      { projectId: project1.id, userId: storeManagerUser.id, role: 'member' },
      { projectId: project1.id, userId: accountantUser.id, role: 'member' },
      { projectId: project2.id, userId: supervisorUser.id, role: 'supervisor' },
      { projectId: project2.id, userId: accountantUser.id, role: 'member' },
      { projectId: project3.id, userId: supervisorUser.id, role: 'supervisor' },
    ],
  })

  // ============ SUPPLIERS ============
  console.log('🏭 Creating suppliers...')
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        name: 'UltraTech Cement Ltd',
        code: 'SUP-001',
        contact: 'Vikram Singh',
        email: 'sales@ultratech.example.com',
        phone: '+91 80 4567 8901',
        address: 'No 42, Industrial Area, Hosur Road, Bangalore',
        gstNo: '29AABCU9630R1ZM',
        isActive: true,
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'Tata Steel Distributors',
        code: 'SUP-002',
        contact: 'Arjun Mehta',
        email: 'orders@tatadist.example.com',
        phone: '+91 80 5678 9012',
        address: 'No 15, Steel Yard, Peenya Industrial Area, Bangalore',
        gstNo: '29AABCT1234R1ZM',
        isActive: true,
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'Deccan Sand & Aggregates',
        code: 'SUP-003',
        contact: 'Ravi Gowda',
        email: 'info@deccansand.example.com',
        phone: '+91 80 6789 0123',
        address: 'Quarry Road, Mysore Road, Bangalore',
        gstNo: '29AABCD5678R1ZM',
        isActive: true,
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'Asian Paints - Construction Division',
        code: 'SUP-004',
        contact: 'Kavitha Nair',
        email: 'bulk@asianpaints.example.com',
        phone: '+91 80 7890 1234',
        address: 'No 88, Hardware Lane, KR Puram, Bangalore',
        gstNo: '29AABCA9012R1ZM',
        isActive: true,
      },
    }),
  ])

  // ============ MATERIALS ============
  console.log('🧱 Creating materials...')
  const materials = await Promise.all([
    prisma.material.create({
      data: {
        name: 'OPC Cement (53 Grade)',
        code: 'MAT-001',
        unit: 'bags',
        category: 'Cement',
        description: 'Ordinary Portland Cement 53 Grade - 50kg bags',
        currentStock: 450,
        minStock: 200,
        unitPrice: 380,
      },
    }),
    prisma.material.create({
      data: {
        name: 'TMT Steel Bars (12mm)',
        code: 'MAT-002',
        unit: 'kg',
        category: 'Steel',
        description: 'Thermo Mechanically Treated steel bars 12mm diameter',
        currentStock: 3200,
        minStock: 1000,
        unitPrice: 62,
      },
    }),
    prisma.material.create({
      data: {
        name: 'TMT Steel Bars (16mm)',
        code: 'MAT-003',
        unit: 'kg',
        category: 'Steel',
        description: 'Thermo Mechanically Treated steel bars 16mm diameter',
        currentStock: 1800,
        minStock: 800,
        unitPrice: 65,
      },
    }),
    prisma.material.create({
      data: {
        name: 'River Sand',
        code: 'MAT-004',
        unit: 'cft',
        category: 'Aggregates',
        description: 'Clean river sand for construction',
        currentStock: 80,
        minStock: 100,
        unitPrice: 55,
      },
    }),
    prisma.material.create({
      data: {
        name: 'M-Sand (Manufactured)',
        code: 'MAT-005',
        unit: 'cft',
        category: 'Aggregates',
        description: 'Manufactured sand - P-Sand quality',
        currentStock: 200,
        minStock: 150,
        unitPrice: 45,
      },
    }),
    prisma.material.create({
      data: {
        name: 'Gravel (20mm)',
        code: 'MAT-006',
        unit: 'cft',
        category: 'Aggregates',
        description: '20mm jelly / gravel for concrete mixing',
        currentStock: 150,
        minStock: 100,
        unitPrice: 40,
      },
    }),
    prisma.material.create({
      data: {
        name: 'Red Clay Bricks',
        code: 'MAT-007',
        unit: 'pcs',
        category: 'Bricks',
        description: 'Standard red clay bricks 230x110x75mm',
        currentStock: 25000,
        minStock: 10000,
        unitPrice: 8,
      },
    }),
    prisma.material.create({
      data: {
        name: 'AAC Blocks (600x200x200)',
        code: 'MAT-008',
        unit: 'pcs',
        category: 'Bricks',
        description: 'Autoclaved Aerated Concrete blocks',
        currentStock: 3000,
        minStock: 1000,
        unitPrice: 85,
      },
    }),
    prisma.material.create({
      data: {
        name: 'Exterior Emulsion Paint',
        code: 'MAT-009',
        unit: 'ltr',
        category: 'Paint',
        description: 'Weather-proof exterior emulsion paint - 20ltr drums',
        currentStock: 40,
        minStock: 20,
        unitPrice: 320,
      },
    }),
    prisma.material.create({
      data: {
        name: 'PVC Pipes (4 inch)',
        code: 'MAT-010',
        unit: 'pcs',
        category: 'Plumbing',
        description: 'PVC plumbing pipes 4 inch diameter - 3m length',
        currentStock: 120,
        minStock: 50,
        unitPrice: 280,
      },
    }),
    prisma.material.create({
      data: {
        name: 'Electrical Wire (3mm)',
        code: 'MAT-011',
        unit: 'm',
        category: 'Electrical',
        description: 'Copper electrical wire 3mm² - 90m coil',
        currentStock: 500,
        minStock: 200,
        unitPrice: 28,
      },
    }),
    prisma.material.create({
      data: {
        name: 'Vitrified Tiles (2x2 ft)',
        code: 'MAT-012',
        unit: 'sqft',
        category: 'Finishing',
        description: 'Premium vitrified floor tiles 600x600mm',
        currentStock: 800,
        minStock: 300,
        unitPrice: 75,
      },
    }),
    prisma.material.create({
      data: {
        name: 'Clear Float Glass (5mm)',
        code: 'MAT-013',
        unit: 'sqft',
        category: 'Finishing',
        description: '5mm clear float glass for windows',
        currentStock: 150,
        minStock: 100,
        unitPrice: 95,
      },
    }),
  ])

  // ============ LABOUR GROUPS & LABOUR ============
  console.log('👷 Creating labour groups and labour...')
  const labourGroups = await Promise.all([
    prisma.labourGroup.create({ data: { name: 'Mason', rate: 900, isActive: true } }),
    prisma.labourGroup.create({ data: { name: 'Carpenter', rate: 850, isActive: true } }),
    prisma.labourGroup.create({ data: { name: 'Electrician', rate: 950, isActive: true } }),
    prisma.labourGroup.create({ data: { name: 'Plumber', rate: 900, isActive: true } }),
    prisma.labourGroup.create({ data: { name: 'Painter', rate: 750, isActive: true } }),
    prisma.labourGroup.create({ data: { name: 'Helper', rate: 550, isActive: true } }),
  ])

  const labourData: Array<{ groupId: string; name: string; phone: string; aadhaar: string; dailyRate: number }> = []

  const labourNames: Record<string, string[]> = {
    Mason: ['Ramu K', 'Krishna M', 'Soma N'],
    Carpenter: ['Raju B', 'Manja T', 'Giri S'],
    Electrician: ['Shankar P', 'Mohan R', 'Venkat D'],
    Plumber: ['Nagaraj K', 'Basava G', 'Thimma H'],
    Painter: ['Deva J', 'Chandra M', 'Kempa R'],
    Helper: ['Muni B', 'Sidda V', 'Lakshman T'],
  }

  for (const group of labourGroups) {
    const names = labourNames[group.name] || []
    for (let i = 0; i < names.length; i++) {
      labourData.push({
        groupId: group.id,
        name: names[i],
        phone: `+91 ${Math.floor(7000000000 + Math.random() * 3000000000)}`,
        aadhaar: `${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`,
        dailyRate: group.rate,
      })
    }
  }

  const labours = await Promise.all(
    labourData.map((l) =>
      prisma.labour.create({
        data: l,
      })
    )
  )

  // ============ ATTENDANCE ============
  console.log('📋 Creating attendance records...')
  const attendanceData = []
  const todayDate = today()

  for (let dayOffset = 1; dayOffset <= 5; dayOffset++) {
    const date = daysAgo(dayOffset)
    // Pick a subset of labours for each project
    const projectLabours1 = labours.slice(0, 10)
    const projectLabours2 = labours.slice(6, 18)

    for (const labour of projectLabours1) {
      const status = Math.random() > 0.15 ? 'present' : Math.random() > 0.5 ? 'half_day' : 'absent'
      if (status !== 'absent') {
        attendanceData.push({
          projectId: project1.id,
          labourId: labour.id,
          date,
          status,
          hoursWorked: status === 'half_day' ? 4.5 : 8 + Math.random() * 2,
          overtime: Math.random() > 0.7 ? 1 + Math.random() * 2 : 0,
        })
      }
    }

    for (const labour of projectLabours2) {
      const status = Math.random() > 0.1 ? 'present' : Math.random() > 0.5 ? 'half_day' : 'absent'
      if (status !== 'absent') {
        attendanceData.push({
          projectId: project2.id,
          labourId: labour.id,
          date,
          status,
          hoursWorked: status === 'half_day' ? 4.5 : 8 + Math.random() * 2,
          overtime: Math.random() > 0.7 ? 1 + Math.random() * 2 : 0,
        })
      }
    }
  }

  // Today's attendance for project 1
  for (const labour of labours.slice(0, 12)) {
    attendanceData.push({
      projectId: project1.id,
      labourId: labour.id,
      date: todayDate,
      status: 'present',
      hoursWorked: 8,
    })
  }
  // Today's attendance for project 2
  for (const labour of labours.slice(5, 16)) {
    attendanceData.push({
      projectId: project2.id,
      labourId: labour.id,
      date: todayDate,
      status: 'present',
      hoursWorked: 8,
    })
  }

  // Create attendance - deduplicate by (projectId, labourId, date)
  const uniqueAttendance = new Map<string, typeof attendanceData[0]>()
  for (const a of attendanceData) {
    const key = `${a.projectId}-${a.labourId}-${a.date.toISOString().slice(0, 10)}`
    if (!uniqueAttendance.has(key)) {
      uniqueAttendance.set(key, a)
    }
  }

  const attendanceBatch = Array.from(uniqueAttendance.values())
  for (let i = 0; i < attendanceBatch.length; i += 50) {
    await prisma.attendance.createMany({
      data: attendanceBatch.slice(i, i + 50),
    })
  }

  // ============ DAILY NOTES ============
  console.log('📝 Creating daily notes...')
  await prisma.dailyNote.createMany({
    data: [
      {
        projectId: project1.id,
        date: daysAgo(1),
        weather: 'Sunny',
        temperature: 32,
        workDone: 'Completed slab casting for 7th floor. Steel fixing in progress for 8th floor. Brick work continues on 3rd to 5th floors.',
        issues: 'Concrete delivery delayed by 2 hours due to traffic. Need to reschedule tomorrow\'s pour earlier.',
        labourCount: 45,
        supervisorId: supervisorUser.id,
      },
      {
        projectId: project1.id,
        date: daysAgo(2),
        weather: 'Partly Cloudy',
        temperature: 29,
        workDone: 'Shuttering work for 8th floor slab. Plastering completed on 2nd floor. Electrical conduit work on 4th floor.',
        issues: 'None',
        labourCount: 42,
        supervisorId: supervisorUser.id,
      },
      {
        projectId: project1.id,
        date: daysAgo(3),
        weather: 'Rainy',
        temperature: 26,
        workDone: 'Interior finishing work on 1st floor. Staircase construction continued. Plumber started pipeline work on 3rd floor.',
        issues: 'Rain stopped work after 2 PM. Some water seepage in basement area needs attention.',
        labourCount: 30,
        supervisorId: supervisorUser.id,
      },
      {
        projectId: project2.id,
        date: daysAgo(1),
        weather: 'Sunny',
        temperature: 33,
        workDone: 'Tile laying in Block A - 3rd and 4th floors. Painting work started in Block B - 5th floor. External plastering completed.',
        issues: 'Tile batch variation noticed. Need to check with supplier.',
        labourCount: 38,
        supervisorId: supervisorUser.id,
      },
      {
        projectId: project2.id,
        date: daysAgo(2),
        weather: 'Sunny',
        temperature: 31,
        workDone: 'Electrical wiring completed up to 6th floor Block A. Plumbing work ongoing. Lift installation crew arrived.',
        issues: 'Lift shaft dimensions need minor adjustment.',
        labourCount: 35,
        supervisorId: supervisorUser.id,
      },
    ],
  })

  // ============ INVOICES ============
  console.log('💰 Creating invoices and payments...')
  const inv1 = await prisma.invoice.create({
    data: {
      projectId: project1.id,
      invoiceNo: 'INV-2025-001',
      type: 'sales',
      status: 'paid',
      issueDate: monthsAgo(5),
      dueDate: daysAgo(120),
      subtotal: 5000000,
      tax: 900000,
      discount: 50000,
      total: 5850000,
      paidAmount: 5850000,
      retention: 0,
    },
  })

  await prisma.invoiceItem.createMany({
    data: [
      { invoiceId: inv1.id, description: 'Excavation & Foundation Work - Stage 1', quantity: 1, unit: 'lot', unitPrice: 3000000, amount: 3000000 },
      { invoiceId: inv1.id, description: 'Piling Work - 24 piles', quantity: 24, unit: 'nos', unitPrice: 83333, amount: 2000000 },
    ],
  })

  await prisma.payment.create({
    data: {
      projectId: project1.id,
      invoiceId: inv1.id,
      paymentNo: 'PAY-2025-001',
      amount: 5850000,
      method: 'bank_transfer',
      status: 'completed',
      reference: 'NEFT-REF-001234',
      date: daysAgo(118),
      receivedBy: accountantUser.name,
      notes: 'Full payment received against INV-2025-001',
    },
  })

  const inv2 = await prisma.invoice.create({
    data: {
      projectId: project1.id,
      invoiceNo: 'INV-2025-002',
      type: 'sales',
      status: 'partial',
      issueDate: monthsAgo(2),
      dueDate: daysAgo(30),
      subtotal: 8000000,
      tax: 1440000,
      discount: 0,
      total: 9440000,
      paidAmount: 5000000,
      retention: 0,
    },
  })

  await prisma.invoiceItem.createMany({
    data: [
      { invoiceId: inv2.id, description: 'Structural Work - GF to 5th Floor', quantity: 1, unit: 'lot', unitPrice: 5000000, amount: 5000000 },
      { invoiceId: inv2.id, description: 'Block Work - GF to 3rd Floor', quantity: 1, unit: 'lot', unitPrice: 3000000, amount: 3000000 },
    ],
  })

  await prisma.payment.create({
    data: {
      projectId: project1.id,
      invoiceId: inv2.id,
      paymentNo: 'PAY-2025-005',
      amount: 5000000,
      method: 'bank_transfer',
      status: 'completed',
      reference: 'NEFT-REF-005678',
      date: daysAgo(25),
      receivedBy: accountantUser.name,
    },
  })

  const inv3 = await prisma.invoice.create({
    data: {
      projectId: project2.id,
      invoiceNo: 'INV-2025-003',
      type: 'sales',
      status: 'sent',
      issueDate: daysAgo(10),
      dueDate: daysFromNow(20),
      subtotal: 6500000,
      tax: 1170000,
      discount: 0,
      total: 7670000,
      paidAmount: 0,
      retention: 0,
    },
  })

  await prisma.invoiceItem.createMany({
    data: [
      { invoiceId: inv3.id, description: 'Superstructure - Block A (6th-10th Floor)', quantity: 1, unit: 'lot', unitPrice: 4000000, amount: 4000000 },
      { invoiceId: inv3.id, description: 'Common Area Finishing', quantity: 1, unit: 'lot', unitPrice: 2500000, amount: 2500000 },
    ],
  })

  const inv4 = await prisma.invoice.create({
    data: {
      projectId: project2.id,
      invoiceNo: 'INV-2025-004',
      type: 'sales',
      status: 'overdue',
      issueDate: daysAgo(45),
      dueDate: daysAgo(15),
      subtotal: 4500000,
      tax: 810000,
      discount: 0,
      total: 5310000,
      paidAmount: 0,
      retention: 0,
    },
  })

  await prisma.invoiceItem.createMany({
    data: [
      { invoiceId: inv4.id, description: 'Electrical & Plumbing - Block A', quantity: 1, unit: 'lot', unitPrice: 3000000, amount: 3000000 },
      { invoiceId: inv4.id, description: 'External Development Works', quantity: 1, unit: 'lot', unitPrice: 1500000, amount: 1500000 },
    ],
  })

  // More recent payment
  await prisma.payment.create({
    data: {
      projectId: project2.id,
      invoiceId: inv2.id,
      paymentNo: 'PAY-2025-008',
      amount: 2000000,
      method: 'online',
      status: 'completed',
      reference: 'UPI-REF-009988',
      date: daysAgo(3),
      receivedBy: accountantUser.name,
    },
  })

  await prisma.payment.create({
    data: {
      projectId: project1.id,
      invoiceId: inv2.id,
      paymentNo: 'PAY-2025-009',
      amount: 1500000,
      method: 'cheque',
      status: 'pending',
      reference: 'CHQ-2025-001',
      date: todayDate,
      receivedBy: accountantUser.name,
    },
  })

  // ============ EXPENSES ============
  console.log('💸 Creating expenses...')
  await prisma.expense.createMany({
    data: [
      {
        projectId: project1.id,
        category: 'Labour',
        description: 'Weekly labour wages - Week 22',
        amount: 185000,
        date: daysAgo(3),
        createdById: supervisorUser.id,
        approvedBy: adminUser.id,
        status: 'approved',
      },
      {
        projectId: project1.id,
        category: 'Material',
        description: 'Cement purchase - 200 bags UltraTech',
        amount: 76000,
        date: daysAgo(5),
        createdById: storeManagerUser.id,
        approvedBy: adminUser.id,
        status: 'approved',
      },
      {
        projectId: project1.id,
        category: 'Transport',
        description: 'Sand and aggregate delivery charges',
        amount: 15000,
        date: daysAgo(4),
        createdById: supervisorUser.id,
        status: 'pending',
      },
      {
        projectId: project1.id,
        category: 'Equipment',
        description: 'Concrete mixer rental - weekly',
        amount: 12000,
        date: daysAgo(2),
        createdById: supervisorUser.id,
        approvedBy: adminUser.id,
        status: 'approved',
      },
      {
        projectId: project2.id,
        category: 'Labour',
        description: 'Weekly labour wages - Week 22',
        amount: 145000,
        date: daysAgo(3),
        createdById: supervisorUser.id,
        approvedBy: adminUser.id,
        status: 'approved',
      },
      {
        projectId: project2.id,
        category: 'Material',
        description: 'Tiles and sanitary ware - Block A',
        amount: 225000,
        date: daysAgo(7),
        createdById: storeManagerUser.id,
        approvedBy: adminUser.id,
        status: 'approved',
      },
      {
        projectId: project2.id,
        category: 'Miscellaneous',
        description: 'Site cleaning and waste disposal',
        amount: 8000,
        date: daysAgo(1),
        createdById: supervisorUser.id,
        status: 'pending',
      },
    ],
  })

  // ============ PURCHASE REQUESTS ============
  console.log('📦 Creating purchase requests...')
  const pr1 = await prisma.purchaseRequest.create({
    data: {
      projectId: project1.id,
      requestNo: 'PR-2025-001',
      status: 'approved',
      requiredBy: daysFromNow(14),
      notes: 'Urgent requirement for 8th floor slab work',
      createdById: supervisorUser.id,
      approvedById: adminUser.id,
    },
  })

  await prisma.purchaseRequestItem.createMany({
    data: [
      { purchaseRequestId: pr1.id, materialId: materials[0].id, description: 'OPC Cement 53 Grade', quantity: 500, unit: 'bags', estimatedPrice: 190000 },
      { purchaseRequestId: pr1.id, materialId: materials[1].id, description: 'TMT Steel Bars 12mm', quantity: 2000, unit: 'kg', estimatedPrice: 124000 },
      { purchaseRequestId: pr1.id, materialId: materials[5].id, description: 'Gravel 20mm', quantity: 100, unit: 'cft', estimatedPrice: 4000 },
    ],
  })

  const pr2 = await prisma.purchaseRequest.create({
    data: {
      projectId: project1.id,
      requestNo: 'PR-2025-002',
      status: 'submitted',
      requiredBy: daysFromNow(21),
      notes: 'Electrical materials for 5th floor wiring',
      createdById: supervisorUser.id,
    },
  })

  await prisma.purchaseRequestItem.createMany({
    data: [
      { purchaseRequestId: pr2.id, materialId: materials[10].id, description: 'Electrical Wire 3mm', quantity: 500, unit: 'm', estimatedPrice: 14000 },
    ],
  })

  const pr3 = await prisma.purchaseRequest.create({
    data: {
      projectId: project2.id,
      requestNo: 'PR-2025-003',
      status: 'submitted',
      requiredBy: daysFromNow(10),
      notes: 'Painting materials for Block B finishing',
      createdById: supervisorUser.id,
    },
  })

  await prisma.purchaseRequestItem.createMany({
    data: [
      { purchaseRequestId: pr3.id, materialId: materials[8].id, description: 'Exterior Emulsion Paint', quantity: 60, unit: 'ltr', estimatedPrice: 19200 },
      { purchaseRequestId: pr3.id, materialId: materials[11].id, description: 'Vitrified Tiles 2x2', quantity: 400, unit: 'sqft', estimatedPrice: 30000 },
    ],
  })

  const pr4 = await prisma.purchaseRequest.create({
    data: {
      projectId: project2.id,
      requestNo: 'PR-2025-004',
      status: 'draft',
      requiredBy: daysFromNow(30),
      notes: 'Plumbing fixtures for Block A',
      createdById: storeManagerUser.id,
    },
  })

  await prisma.purchaseRequestItem.createMany({
    data: [
      { purchaseRequestId: pr4.id, materialId: materials[9].id, description: 'PVC Pipes 4 inch', quantity: 80, unit: 'pcs', estimatedPrice: 22400 },
    ],
  })

  // ============ PURCHASE ORDERS ============
  console.log('📋 Creating purchase orders...')
  await prisma.purchaseOrder.create({
    data: {
      projectId: project1.id,
      purchaseRequestId: pr1.id,
      supplierId: suppliers[0].id,
      orderNo: 'PO-2025-001',
      status: 'partially_received',
      orderDate: daysAgo(7),
      expectedDate: daysFromNow(5),
      subtotal: 265000,
      tax: 47700,
      total: 312700,
      notes: 'Deliver to Skyline Tower site. Contact supervisor on arrival.',
    },
  })

  await prisma.purchaseOrder.create({
    data: {
      projectId: project2.id,
      supplierId: suppliers[2].id,
      orderNo: 'PO-2025-002',
      status: 'sent',
      orderDate: daysAgo(3),
      expectedDate: daysFromNow(10),
      subtotal: 180000,
      tax: 32400,
      total: 212400,
      notes: 'M-Sand and Gravel for Green Valley project.',
    },
  })

  // ============ ASSETS ============
  console.log('🔧 Creating assets...')
  const assets = await Promise.all([
    prisma.asset.create({
      data: {
        name: 'Concrete Mixer Machine',
        code: 'AST-001',
        type: 'equipment',
        category: 'Heavy Equipment',
        purchaseDate: daysAgo(300),
        purchasePrice: 85000,
        currentValue: 68000,
        status: 'issued',
        location: 'Skyline Tower Site',
      },
    }),
    prisma.asset.create({
      data: {
        name: 'Bar Bending Machine',
        code: 'AST-002',
        type: 'equipment',
        category: 'Steel Equipment',
        purchaseDate: daysAgo(250),
        purchasePrice: 45000,
        currentValue: 36000,
        status: 'issued',
        location: 'Skyline Tower Site',
      },
    }),
    prisma.asset.create({
      data: {
        name: 'Vibrator (Needle Type)',
        code: 'AST-003',
        type: 'tool',
        category: 'Concrete Tools',
        purchaseDate: daysAgo(180),
        purchasePrice: 12000,
        currentValue: 10000,
        status: 'available',
        location: 'Central Store',
      },
    }),
    prisma.asset.create({
      data: {
        name: 'Tata Ace - Site Vehicle',
        code: 'AST-004',
        type: 'vehicle',
        category: 'Transport',
        purchaseDate: daysAgo(365),
        purchasePrice: 550000,
        currentValue: 420000,
        status: 'issued',
        location: 'Green Valley Site',
      },
    }),
    prisma.asset.create({
      data: {
        name: 'Scaffolding Set (20 frames)',
        code: 'AST-005',
        type: 'equipment',
        category: 'Safety Equipment',
        purchaseDate: daysAgo(200),
        purchasePrice: 120000,
        currentValue: 96000,
        status: 'issued',
        location: 'Green Valley Site',
      },
    }),
    prisma.asset.create({
      data: {
        name: 'Power Drill Set',
        code: 'AST-006',
        type: 'tool',
        category: 'Power Tools',
        purchaseDate: daysAgo(90),
        purchasePrice: 8500,
        currentValue: 7500,
        status: 'maintenance',
        location: 'Workshop',
      },
    }),
  ])

  // Asset issues
  await prisma.assetIssue.createMany({
    data: [
      { assetId: assets[0].id, issuedTo: 'Site - Skyline Tower', issuedById: storeManagerUser.id, issuedDate: daysAgo(30), status: 'issued' },
      { assetId: assets[1].id, issuedTo: 'Site - Skyline Tower', issuedById: storeManagerUser.id, issuedDate: daysAgo(25), status: 'issued' },
      { assetId: assets[3].id, issuedTo: 'Site - Green Valley', issuedById: storeManagerUser.id, issuedDate: daysAgo(60), status: 'issued' },
      { assetId: assets[4].id, issuedTo: 'Site - Green Valley', issuedById: storeManagerUser.id, issuedDate: daysAgo(45), status: 'issued' },
    ],
  })

  // ============ PRODUCT CATEGORIES & PRODUCTS ============
  console.log('🏷️ Creating product categories and products...')
  const cat1 = await prisma.productCategory.create({ data: { name: 'Cement & Binding', isActive: true } })
  const cat2 = await prisma.productCategory.create({ data: { name: 'Steel & Metals', isActive: true } })
  const cat3 = await prisma.productCategory.create({ data: { name: 'Plumbing & Fittings', isActive: true } })
  const cat4 = await prisma.productCategory.create({ data: { name: 'Electrical & Lighting', isActive: true } })
  const cat5 = await prisma.productCategory.create({ data: { name: 'Tiles & Flooring', isActive: true } })

  await prisma.product.createMany({
    data: [
      { categoryId: cat1.id, name: 'OPC Cement 53 Grade (50kg)', sku: 'PCB-001', brand: 'UltraTech', unit: 'bags', costPrice: 340, sellingPrice: 390, currentStock: 200, minStock: 50, isActive: true },
      { categoryId: cat1.id, name: 'PPC Cement (50kg)', sku: 'PCB-002', brand: 'ACC', unit: 'bags', costPrice: 310, sellingPrice: 355, currentStock: 150, minStock: 50, isActive: true },
      { categoryId: cat1.id, name: 'White Cement (25kg)', sku: 'PCB-003', brand: 'Birla', unit: 'bags', costPrice: 280, sellingPrice: 330, currentStock: 60, minStock: 20, isActive: true },
      { categoryId: cat2.id, name: 'TMT Bar 12mm', sku: 'PSM-001', brand: 'Tata Tiscon', unit: 'kg', costPrice: 56, sellingPrice: 66, currentStock: 5000, minStock: 1000, isActive: true },
      { categoryId: cat2.id, name: 'TMT Bar 16mm', sku: 'PSM-002', brand: 'Tata Tiscon', unit: 'kg', costPrice: 59, sellingPrice: 69, currentStock: 3000, minStock: 800, isActive: true },
      { categoryId: cat2.id, name: 'MS Angles 50x50x5mm', sku: 'PSM-003', brand: 'SAIL', unit: 'kg', costPrice: 52, sellingPrice: 62, currentStock: 800, minStock: 200, isActive: true },
      { categoryId: cat3.id, name: 'CPVC Pipe 1/2 inch', sku: 'PPL-001', brand: 'Astral', unit: 'pcs', costPrice: 120, sellingPrice: 150, currentStock: 300, minStock: 50, isActive: true },
      { categoryId: cat3.id, name: 'PVC Pipe 4 inch', sku: 'PPL-002', brand: 'Supreme', unit: 'pcs', costPrice: 250, sellingPrice: 300, currentStock: 100, minStock: 30, isActive: true },
      { categoryId: cat4.id, name: 'LED Panel Light 36W', sku: 'PEL-001', brand: 'Philips', unit: 'pcs', costPrice: 850, sellingPrice: 1100, currentStock: 80, minStock: 20, isActive: true },
      { categoryId: cat4.id, name: 'Wire 3mm² (90m coil)', sku: 'PEL-002', brand: 'Polycab', unit: 'coil', costPrice: 2200, sellingPrice: 2700, currentStock: 40, minStock: 10, isActive: true },
      { categoryId: cat5.id, name: 'Vitrified Tile 600x600mm', sku: 'PTF-001', brand: 'Kajaria', unit: 'sqft', costPrice: 60, sellingPrice: 80, currentStock: 2000, minStock: 500, isActive: true },
      { categoryId: cat5.id, name: 'Anti-Skid Floor Tile', sku: 'PTF-002', brand: 'Somany', unit: 'sqft', costPrice: 55, sellingPrice: 75, currentStock: 800, minStock: 200, isActive: true },
    ],
  })

  // ============ CUSTOMERS ============
  console.log('🤝 Creating customers...')
  await prisma.customer.createMany({
    data: [
      {
        name: 'Skyline Developers Pvt Ltd',
        email: 'projects@skylinebuilders.example.com',
        phone: '+91 80 2345 6789',
        address: '5th Floor, Skyline Towers, MG Road, Bangalore - 560001',
        gstNo: '29AABCS5678R1ZM',
        balance: 4440000,
        isActive: true,
      },
      {
        name: 'Green Valley Housing Society',
        email: 'secretary@greenvalleyhs.example.com',
        phone: '+91 80 3456 7890',
        address: 'No 22, HSR Layout, Bangalore - 560102',
        gstNo: '29AABCG1234R1ZM',
        balance: 12980000,
        isActive: true,
      },
      {
        name: 'Bangalore Metro Rail Corp',
        email: 'contracts@bmrcl.example.com',
        phone: '+91 80 4567 8901',
        address: 'BMTC Complex, Shanthinagar, Bangalore - 560027',
        gstNo: '29AABCB5678R1ZM',
        balance: 0,
        isActive: true,
      },
      {
        name: 'Rajesh Constructions',
        email: 'rajesh@rajeshconst.example.com',
        phone: '+91 80 5678 9012',
        address: 'No 77, Peenya Industrial Area, Bangalore',
        gstNo: '29AABCR9012R1ZM',
        balance: 350000,
        isActive: true,
      },
    ],
  })

  // ============ PROJECT TASKS ============
  console.log('✅ Creating project tasks...')
  const task1 = await prisma.projectTask.create({
    data: {
      projectId: project1.id,
      title: 'Complete 8th Floor Slab Casting',
      description: 'Cast the RCC slab for 8th floor including beam and slab reinforcement',
      status: 'in_progress',
      priority: 'high',
      startDate: daysAgo(5),
      endDate: daysFromNow(3),
      progress: 60,
      assigneeId: supervisorUser.id,
      order: 1,
    },
  })

  await prisma.projectTask.create({
    data: {
      projectId: project1.id,
      title: 'Install 7th Floor Electrical Conduits',
      description: 'Run electrical conduits and switch boxes for all rooms on 7th floor',
      status: 'todo',
      priority: 'medium',
      startDate: daysFromNow(2),
      endDate: daysFromNow(10),
      progress: 0,
      assigneeId: supervisorUser.id,
      order: 2,
    },
  })

  await prisma.projectTask.create({
    data: {
      projectId: project2.id,
      title: 'Complete Tile Laying Block A - 4th Floor',
      description: 'Lay vitrified tiles in all rooms of 4th floor, Block A',
      status: 'in_progress',
      priority: 'high',
      startDate: daysAgo(3),
      endDate: daysFromNow(5),
      progress: 40,
      assigneeId: supervisorUser.id,
      order: 1,
    },
  })

  await prisma.projectTask.create({
    data: {
      projectId: project2.id,
      title: 'Paint Block B - 3rd to 5th Floor',
      description: 'Complete interior and exterior painting for Block B floors 3-5',
      status: 'todo',
      priority: 'medium',
      startDate: daysFromNow(5),
      endDate: daysFromNow(18),
      progress: 0,
      assigneeId: supervisorUser.id,
      order: 2,
    },
  })

  await prisma.projectTask.create({
    data: {
      projectId: project2.id,
      title: 'Install Lift Shaft Doors',
      description: 'Install automatic lift doors on all floors of Block A and B',
      status: 'todo',
      priority: 'high',
      startDate: daysFromNow(10),
      endDate: daysFromNow(15),
      progress: 0,
      assigneeId: supervisorUser.id,
      order: 3,
    },
  })

  // ============ STOCK MOVEMENTS ============
  console.log('📊 Creating stock movements...')
  await prisma.stockMovement.createMany({
    data: [
      { projectId: project1.id, materialId: materials[0].id, type: 'in', quantity: 200, unitPrice: 380, reference: 'PO-2025-001', notes: 'Received against PO', date: daysAgo(5) },
      { projectId: project1.id, materialId: materials[0].id, type: 'out', quantity: 50, unitPrice: 380, reference: 'DN-' + daysAgo(3).toISOString().slice(0, 10), notes: 'Issued for 8th floor slab', date: daysAgo(3) },
      { projectId: project1.id, materialId: materials[1].id, type: 'in', quantity: 1000, unitPrice: 62, reference: 'PO-2025-001', notes: 'Received against PO', date: daysAgo(5) },
      { projectId: project2.id, materialId: materials[11].id, type: 'in', quantity: 400, unitPrice: 75, reference: 'PO-2025-002', notes: 'Tiles for Block A', date: daysAgo(10) },
      { projectId: project2.id, materialId: materials[11].id, type: 'out', quantity: 150, unitPrice: 75, reference: 'DN-' + daysAgo(1).toISOString().slice(0, 10), notes: 'Issued for 4th floor', date: daysAgo(1) },
    ],
  })

  // ============ NOTIFICATIONS ============
  console.log('🔔 Creating notifications...')
  await prisma.notification.createMany({
    data: [
      {
        userId: adminUser.id,
        type: 'approval',
        title: 'Purchase Request Awaiting Approval',
        message: 'PR-2025-002 for Skyline Tower requires your approval.',
        data: JSON.stringify({ purchaseRequestId: pr2.id }),
        isRead: false,
      },
      {
        userId: adminUser.id,
        type: 'approval',
        title: 'Purchase Request Awaiting Approval',
        message: 'PR-2025-003 for Green Valley Residences requires your approval.',
        data: JSON.stringify({ purchaseRequestId: pr3.id }),
        isRead: false,
      },
      {
        userId: accountantUser.id,
        type: 'invoice',
        title: 'Invoice Overdue',
        message: 'INV-2025-004 for ₹53,10,000 is overdue by 15 days.',
        data: JSON.stringify({ invoiceId: inv4.id }),
        isRead: true,
      },
      {
        userId: supervisorUser.id,
        type: 'task',
        title: 'Task Deadline Approaching',
        message: '8th Floor Slab Casting is due in 3 days. Current progress: 60%.',
        data: JSON.stringify({ taskId: task1.id }),
        isRead: false,
      },
      {
        userId: adminUser.id,
        type: 'system',
        title: 'New User Registered',
        message: 'Client user Mahesh Agarwal has been registered in the system.',
        isRead: true,
      },
      {
        userId: storeManagerUser.id,
        type: 'reminder',
        title: 'Low Stock Alert',
        message: 'River Sand stock is below minimum level (80/100 cft). Please reorder.',
        isRead: false,
      },
    ],
  })

  // ============ NOTIFICATION PREFERENCES ============
  console.log('⚙️ Creating notification preferences...')
  for (const user of [adminUser, supervisorUser, hrUser, accountantUser, storeManagerUser, clientUser]) {
    await prisma.notificationPreference.create({
      data: {
        userId: user.id,
        inApp: true,
        email: true,
        sms: false,
      },
    })
  }

  // ============ AUDIT LOGS ============
  console.log('📋 Creating audit logs...')
  await prisma.auditLog.createMany({
    data: [
      { userId: adminUser.id, action: 'CREATE', entity: 'Project', entityId: project1.id, newValues: JSON.stringify({ name: project1.name, code: project1.code }), ipAddress: '127.0.0.1', createdAt: daysAgo(90) },
      { userId: adminUser.id, action: 'CREATE', entity: 'Project', entityId: project2.id, newValues: JSON.stringify({ name: project2.name, code: project2.code }), ipAddress: '127.0.0.1', createdAt: daysAgo(150) },
      { userId: adminUser.id, action: 'CREATE', entity: 'User', entityId: supervisorUser.id, newValues: JSON.stringify({ name: supervisorUser.name, role: 'supervisor' }), ipAddress: '127.0.0.1', createdAt: daysAgo(180) },
      { userId: adminUser.id, action: 'UPDATE', entity: 'Project', entityId: project2.id, oldValues: JSON.stringify({ progress: 50 }), newValues: JSON.stringify({ progress: 60 }), ipAddress: '127.0.0.1', createdAt: daysAgo(1) },
      { userId: accountantUser.id, action: 'CREATE', entity: 'Payment', ipAddress: '127.0.0.1', createdAt: daysAgo(3) },
      { userId: storeManagerUser.id, action: 'CREATE', entity: 'PurchaseRequest', entityId: pr2.id, newValues: JSON.stringify({ requestNo: 'PR-2025-002' }), ipAddress: '127.0.0.1', createdAt: daysAgo(2) },
    ],
  })

  console.log('✅ Seeding completed successfully!')
  console.log('')
  console.log('📋 Summary:')
  console.log('  - 6 users (admin, supervisor, hr_manager, accountant, store_manager, client)')
  console.log('  - 3 projects')
  console.log('  - 4 suppliers')
  console.log('  - 13 materials')
  console.log('  - 6 labour groups with 18 labourers')
  console.log('  - Attendance records')
  console.log('  - 5 daily notes')
  console.log('  - 4 invoices with payments')
  console.log('  - 7 expenses')
  console.log('  - 4 purchase requests')
  console.log('  - 2 purchase orders')
  console.log('  - 6 assets')
  console.log('  - 5 product categories with 12 products')
  console.log('  - 4 customers')
  console.log('  - 5 project tasks')
  console.log('  - Stock movements, notifications, audit logs')
  console.log('')
  console.log('🔐 Login credentials:')
  console.log('  Admin:    admin@smartbuild.com / admin123')
  console.log('  Others:   {role}@smartbuild.com / password123')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
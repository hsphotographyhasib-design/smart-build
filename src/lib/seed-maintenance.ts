import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

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

function hoursAgo(hours: number): Date {
  const d = new Date()
  d.setHours(d.getHours() - hours)
  return d
}

function hoursFromNow(hours: number): Date {
  const d = new Date()
  d.setHours(d.getHours() + hours)
  return d
}

async function main() {
  console.log('🔧 Seeding MAINTENANCE MANAGEMENT SYSTEM...')

  // ============ SLA TEMPLATES ============
  console.log('📋 Creating SLA templates...')
  const existingSLA = await prisma.sLATemplate.findFirst()
  if (!existingSLA) {
    await prisma.sLATemplate.createMany({
      data: [
        { name: 'Emergency SLA', priority: 'emergency', responseTimeMinutes: 120, resolutionTimeMinutes: 240, description: 'Critical emergency response within 2 hours, resolution within 4 hours', isActive: true },
        { name: 'High Priority SLA', priority: 'high', responseTimeMinutes: 240, resolutionTimeMinutes: 1440, description: 'High priority response within 4 hours, resolution within 24 hours', isActive: true },
        { name: 'Medium Priority SLA', priority: 'medium', responseTimeMinutes: 1440, resolutionTimeMinutes: 4320, description: 'Medium priority response within 24 hours, resolution within 72 hours', isActive: true },
        { name: 'Low Priority SLA', priority: 'low', responseTimeMinutes: 4320, resolutionTimeMinutes: 10080, description: 'Low priority response within 72 hours, resolution within 7 days', isActive: true },
      ],
    })
    console.log('  ✅ 4 SLA templates created')
  }

  // ============ CUSTOMERS (ensure we have at least 5) ============
  console.log('👥 Ensuring customers exist...')
  let customers = await prisma.customer.findMany()
  if (customers.length < 5) {
    // Delete and recreate to ensure proper data
    const existingCustomerNames = customers.map(c => c.name)
    const customerData = [
      { name: 'Al Haramain Properties', email: 'info@alharamain.com', phone: '+966 12 123 4567', address: 'King Fahd Road, Jeddah', gstNo: 'GST-001', balance: 0, isActive: true },
      { name: 'Al Noor Tower Development', email: 'contact@alnoor.com', phone: '+966 11 987 6543', address: 'King Abdullah Road, Riyadh', gstNo: 'GST-002', balance: 0, isActive: true },
      { name: 'Madinah Gate Mall', email: 'admin@madinahgate.com', phone: '+966 14 555 7890', address: 'Prince Mohammed Road, Madinah', gstNo: 'GST-003', balance: 0, isActive: true },
      { name: 'Red Sea Resort', email: 'maintenance@redsearesort.com', phone: '+966 12 777 8899', address: 'North Coast, Red Sea', gstNo: 'GST-004', balance: 0, isActive: true },
      { name: 'Saudi Industrial City', email: 'ops@saudicity.com', phone: '+966 13 444 2233', address: 'Industrial Zone, Dammam', gstNo: 'GST-005', balance: 0, isActive: true },
    ]
    for (const cd of customerData) {
      if (!existingCustomerNames.includes(cd.name)) {
        const c = await prisma.customer.create({ data: cd })
        customers.push(c)
      }
    }
    console.log(`  ✅ ${customers.length} customers available`)
  }

  // ============ MAINTENANCE SITES ============
  console.log('🏗️ Creating maintenance sites...')
  const existingSites = await prisma.maintenanceSite.count()
  if (existingSites === 0) {
    await prisma.maintenanceSite.createMany({
      data: [
        { customerId: customers[0].id, name: 'Al Haramain HQ', code: 'AHH', address: 'King Fahd Road, Jeddah', latitude: 21.5433, longitude: 39.1728, contactPerson: 'Ahmed Al Rashid', contactPhone: '+966 55 111 2233', description: 'Main headquarters building' },
        { customerId: customers[0].id, name: 'Al Haramain Tower', code: 'AHT', address: 'Prince Sultan Street, Jeddah', latitude: 21.5514, longitude: 39.1650, contactPerson: 'Fatima Hassan', contactPhone: '+966 55 222 3344', description: 'Commercial tower with 30 floors' },
        { customerId: customers[1].id, name: 'Al Noor Construction Site', code: 'ANC', address: 'King Abdullah Road, Riyadh', latitude: 24.7136, longitude: 46.6753, contactPerson: 'Mohammed Al Faisal', contactPhone: '+966 50 333 4455', description: 'Under construction high-rise' },
        { customerId: customers[2].id, name: 'Madinah Gate Mall', code: 'MGM', address: 'Prince Mohammed Road, Madinah', latitude: 24.4672, longitude: 39.6062, contactPerson: 'Khalid Al Madani', contactPhone: '+966 50 444 5566', description: 'Shopping mall complex' },
        { customerId: customers[3].id, name: 'Red Sea Resort Main', code: 'RSM', address: 'North Coast, Red Sea', latitude: 22.3151, longitude: 38.9538, contactPerson: 'Sara Al Amri', contactPhone: '+966 50 555 6677', description: 'Main resort facility' },
        { customerId: customers[3].id, name: 'Red Sea Resort Villas', code: 'RSV', address: 'Villa Zone, North Coast', latitude: 22.3180, longitude: 38.9555, contactPerson: 'Omar Al Harbi', contactPhone: '+966 50 666 7788', description: 'Villa complex' },
        { customerId: customers[4].id, name: 'Industrial Zone A', code: 'IZA', address: 'Industrial Zone, Dammam', latitude: 26.3927, longitude: 49.9777, contactPerson: 'Ali Al Dossari', contactPhone: '+966 50 777 8899', description: 'Factory zone A' },
        { customerId: customers[4].id, name: 'Industrial Zone B', code: 'IZB', address: 'Industrial Zone, Dammam', latitude: 26.3950, longitude: 49.9800, contactPerson: 'Nasser Al Qahtani', contactPhone: '+966 50 888 9900', description: 'Factory zone B' },
      ],
    })
    console.log('  ✅ 8 maintenance sites created')
  }

  const sites = await prisma.maintenanceSite.findMany()

  // ============ TECHNICIAN USERS & PROFILES ============
  console.log('🔧 Creating technician users and profiles...')
  const techUser1 = await prisma.user.findFirst({ where: { email: 'tech.ahmed@smartbuild.com' } })
  let techUsers: any[] = []

  if (!techUser1) {
    const pass = await bcrypt.hash('password123', 10)
    const t1 = await prisma.user.create({ data: { email: 'tech.ahmed@smartbuild.com', password: pass, name: 'Ahmed Al Rashid', phone: '+966 50 111 1111', role: 'technician', isActive: true } })
    const t2 = await prisma.user.create({ data: { email: 'tech.mohammed@smartbuild.com', password: pass, name: 'Mohammed Al Farsi', phone: '+966 50 222 2222', role: 'technician', isActive: true } })
    const t3 = await prisma.user.create({ data: { email: 'tech.khalid@smartbuild.com', password: pass, name: 'Khalid Al Ghamdi', phone: '+966 50 333 3333', role: 'technician', isActive: true } })
    const t4 = await prisma.user.create({ data: { email: 'tech.salem@smartbuild.com', password: pass, name: 'Salem Al Otaibi', phone: '+966 50 444 4444', role: 'technician', isActive: true } })
    const t5 = await prisma.user.create({ data: { email: 'tech.fahad@smartbuild.com', password: pass, name: 'Fahad Al Zahrani', phone: '+966 50 555 5555', role: 'technician', isActive: true } })
    techUsers = [t1, t2, t3, t4, t5]

    // Create technician profiles
    await prisma.technicianProfile.createMany({
      data: [
        { userId: t1.id, specializations: JSON.stringify(['air_conditioning', 'electrical']), certifications: JSON.stringify(['HVAC Certified', 'Electrical License']), availabilityStatus: 'available', latitude: 21.5433, longitude: 39.1728, currentLocation: 'Jeddah', maxJobsPerDay: 6, rating: 4.7, totalCompletedJobs: 156, totalActiveJobs: 2 },
        { userId: t2.id, specializations: JSON.stringify(['plumbing', 'fire_protection']), certifications: JSON.stringify(['Plumbing Master', 'Fire Safety']), availabilityStatus: 'available', latitude: 24.7136, longitude: 46.6753, currentLocation: 'Riyadh', maxJobsPerDay: 5, rating: 4.5, totalCompletedJobs: 128, totalActiveJobs: 1 },
        { userId: t3.id, specializations: JSON.stringify(['electrical', 'it']), certifications: JSON.stringify(['IT Network', 'Electrical']), availabilityStatus: 'busy', latitude: 24.4672, longitude: 39.6062, currentLocation: 'Madinah', maxJobsPerDay: 5, rating: 4.8, totalCompletedJobs: 203, totalActiveJobs: 4 },
        { userId: t4.id, specializations: JSON.stringify(['mechanical', 'civil']), certifications: JSON.stringify(['Mechanical Engineer', 'Civil Works']), availabilityStatus: 'available', latitude: 22.3151, longitude: 38.9538, currentLocation: 'Red Sea Coast', maxJobsPerDay: 4, rating: 4.3, totalCompletedJobs: 89, totalActiveJobs: 0 },
        { userId: t5.id, specializations: JSON.stringify(['air_conditioning', 'cleaning', 'general_maintenance']), certifications: JSON.stringify(['HVAC', 'Facility Management']), availabilityStatus: 'on_leave', latitude: 26.3927, longitude: 49.9777, currentLocation: 'Dammam', maxJobsPerDay: 6, rating: 4.6, totalCompletedJobs: 175, totalActiveJobs: 0 },
      ],
    })
    console.log('  ✅ 5 technician users and profiles created')
  } else {
    techUsers = await prisma.user.findMany({ where: { role: 'technician' } })
  }

  const techProfiles = await prisma.technicianProfile.findMany({ include: { user: true } })

  // ============ ASSETS FOR MAINTENANCE ============
  console.log('🏭 Creating assets for maintenance...')
  const existingAssets = await prisma.asset.count()
  if (existingAssets === 0) {
    await prisma.asset.createMany({
      data: [
        { name: 'Central AC Unit - Floor 5', code: 'AC-F5-001', type: 'equipment', category: 'HVAC', purchaseDate: daysAgo(365), purchasePrice: 45000, currentValue: 38000, status: 'available', location: 'Al Haramain Tower, Floor 5' },
        { name: 'Standby Generator', code: 'GEN-001', type: 'equipment', category: 'Power', purchaseDate: daysAgo(730), purchasePrice: 120000, currentValue: 85000, status: 'available', location: 'Al Haramain HQ, Ground Floor' },
        { name: 'Fire Alarm Panel', code: 'FA-001', type: 'equipment', category: 'Fire Safety', purchaseDate: daysAgo(540), purchasePrice: 25000, currentValue: 20000, status: 'available', location: 'Madinah Gate Mall, Control Room' },
        { name: 'Elevator Unit A', code: 'ELV-A-001', type: 'equipment', category: 'Mechanical', purchaseDate: daysAgo(900), purchasePrice: 200000, currentValue: 150000, status: 'maintenance', location: 'Al Noor Tower, Shaft A' },
        { name: 'Water Pump System', code: 'WP-001', type: 'equipment', category: 'Plumbing', purchaseDate: daysAgo(600), purchasePrice: 15000, currentValue: 11000, status: 'available', location: 'Red Sea Resort, Utility Room' },
        { name: 'CCTV System', code: 'CCTV-001', type: 'equipment', category: 'Security', purchaseDate: daysAgo(365), purchasePrice: 35000, currentValue: 30000, status: 'available', location: 'Industrial Zone A, Perimeter' },
      ],
    })
    console.log('  ✅ 6 assets created')
  }

  const assets = await prisma.asset.findMany()

  // ============ MAINTENANCE TICKETS ============
  console.log('🎫 Creating maintenance tickets...')
  const existingTickets = await prisma.maintenanceTicket.count()
  if (existingTickets === 0) {
    const categories = ['air_conditioning', 'electrical', 'plumbing', 'fire_protection', 'mechanical', 'civil', 'cleaning', 'security', 'it', 'general_maintenance']
    const priorities = ['emergency', 'high', 'medium', 'low']
    const statuses = ['new', 'under_review', 'assigned', 'accepted', 'in_progress', 'pending_parts', 'pending_customer', 'completed', 'customer_verification', 'closed']
    const types = ['complaint', 'work_request', 'emergency', 'inspection', 'quotation', 'preventive_maintenance']

    const year = new Date().getFullYear()

    const ticketsData = [
      // Emergency tickets
      { ticketNo: `CMP-${year}-000001`, type: 'emergency', category: 'air_conditioning', priority: 'emergency', status: 'in_progress', subject: 'AC unit failure - Server Room', description: 'The main AC unit serving the server room has completely failed. Temperature is rising rapidly. Immediate attention required to prevent equipment damage.', customerId: customers[0].id, siteId: sites[0].id, building: 'Main Building', floor: 'Ground Floor', room: 'Server Room', equipmentId: assets[0].id, assignedTechnicianId: techProfiles[0]?.id, contactPerson: 'Ahmed Al Rashid', contactPhone: '+966 55 111 2233', location: 'Jeddah', responseDeadline: hoursFromNow(-1), resolutionDeadline: hoursFromNow(2), actualResponseMinutes: 45, slaBreached: false, labourHours: 3, materialCost: 500, serviceCost: 200, transportCost: 100, totalCost: 800, createdById: techUsers[0]?.id || 'system' },
      { ticketNo: `CMP-${year}-000002`, type: 'emergency', category: 'electrical', priority: 'emergency', status: 'assigned', subject: 'Power outage - Entire Building B', description: 'Complete power outage in Building B. Emergency lights are on but main power is down. Affecting all offices and operations.', customerId: customers[1].id, siteId: sites[2].id, building: 'Building B', floor: 'All Floors', assignedTechnicianId: techProfiles[2]?.id, contactPerson: 'Mohammed Al Faisal', contactPhone: '+966 50 333 4455', location: 'Riyadh', responseDeadline: hoursFromNow(1), resolutionDeadline: hoursFromNow(3), actualResponseMinutes: 30, slaBreached: false, createdById: techUsers[0]?.id || 'system' },

      // High priority
      { ticketNo: `CMP-${year}-000003`, type: 'complaint', category: 'plumbing', priority: 'high', status: 'in_progress', subject: 'Water leak in executive office', description: 'Major water leak from ceiling in the executive suite on floor 12. Water damage spreading to adjacent offices. Urgent repair needed.', customerId: customers[0].id, siteId: sites[1].id, building: 'Al Haramain Tower', floor: 'Floor 12', room: 'Executive Suite', equipmentId: assets[4].id, assignedTechnicianId: techProfiles[1]?.id, contactPerson: 'Fatima Hassan', contactPhone: '+966 55 222 3344', responseDeadline: hoursFromNow(-2), resolutionDeadline: hoursFromNow(18), actualResponseMinutes: 90, labourHours: 5, materialCost: 1200, serviceCost: 500, totalCost: 1700, createdById: techUsers[0]?.id || 'system' },
      { ticketNo: `CMP-${year}-000004`, type: 'work_request', category: 'fire_protection', priority: 'high', status: 'under_review', subject: 'Fire alarm system inspection', description: 'Annual fire alarm system inspection and testing required for Building A. All floors need to be checked.', customerId: customers[2].id, siteId: sites[3].id, building: 'Main Mall', floor: 'All Floors', equipmentId: assets[2].id, contactPerson: 'Khalid Al Madani', contactPhone: '+966 50 444 5566', responseDeadline: hoursFromNow(2), resolutionDeadline: hoursFromNow(20), createdById: techUsers[0]?.id || 'system' },

      // Medium priority
      { ticketNo: `CMP-${year}-000005`, type: 'complaint', category: 'electrical', priority: 'medium', status: 'pending_customer', subject: 'Flickering lights in parking area', description: 'LED lights in parking levels B1 and B2 are flickering intermittently. Some lights have completely failed.', customerId: customers[2].id, siteId: sites[3].id, building: 'Parking', floor: 'B1, B2', contactPerson: 'Khalid Al Madani', contactPhone: '+966 50 444 5566', responseDeadline: hoursFromNow(-8), resolutionDeadline: hoursFromNow(60), actualResponseMinutes: 180, actualResolutionMinutes: 1200, labourHours: 4, materialCost: 350, serviceCost: 200, totalCost: 550, customerApproved: false, assignedTechnicianId: techProfiles[2]?.id, createdById: techUsers[0]?.id || 'system' },
      { ticketNo: `CMP-${year}-000006`, type: 'work_request', category: 'cleaning', priority: 'medium', status: 'assigned', subject: 'Deep cleaning of lobby and reception', description: 'Quarterly deep cleaning of main lobby, reception area, and conference rooms. Include carpet shampooing and window cleaning.', customerId: customers[0].id, siteId: sites[0].id, building: 'Main Building', floor: 'Ground Floor', room: 'Lobby, Reception', contactPerson: 'Ahmed Al Rashid', contactPhone: '+966 55 111 2233', preferredVisitDate: daysFromNow(3), preferredVisitTime: '09:00', responseDeadline: hoursFromNow(-4), resolutionDeadline: hoursFromNow(65), actualResponseMinutes: 120, assignedTechnicianId: techProfiles[4]?.id, createdById: techUsers[0]?.id || 'system' },
      { ticketNo: `CMP-${year}-000007`, type: 'complaint', category: 'air_conditioning', priority: 'medium', status: 'in_progress', subject: 'AC not cooling properly in office 305', description: 'AC in office 305 is running but not cooling effectively. Temperature in room is 28°C despite AC being set to 22°C.', customerId: customers[3].id, siteId: sites[4].id, building: 'Main Building', floor: 'Floor 3', room: 'Office 305', equipmentId: assets[0].id, assignedTechnicianId: techProfiles[0]?.id, contactPerson: 'Sara Al Amri', contactPhone: '+966 50 555 6677', location: 'Red Sea Coast', responseDeadline: hoursFromNow(-12), resolutionDeadline: hoursFromNow(55), actualResponseMinutes: 240, labourHours: 2, materialCost: 200, serviceCost: 150, totalCost: 350, createdById: techUsers[0]?.id || 'system' },

      // Low priority
      { ticketNo: `CMP-${year}-000008`, type: 'work_request', category: 'general_maintenance', priority: 'low', status: 'new', subject: 'Repaint parking area markings', description: 'Parking area line markings and directional arrows have faded and need repainting. Include handicap parking areas.', customerId: customers[1].id, siteId: sites[2].id, building: 'Parking', contactPerson: 'Mohammed Al Faisal', contactPhone: '+966 50 333 4455', preferredVisitDate: daysFromNow(14), createdById: techUsers[0]?.id || 'system' },
      { ticketNo: `CMP-${year}-000009`, type: 'inspection', category: 'mechanical', priority: 'low', status: 'new', subject: 'Elevator annual inspection', description: 'Annual safety inspection required for all 3 elevator units. Check cables, brakes, sensors, and emergency systems.', customerId: customers[0].id, siteId: sites[1].id, building: 'Al Haramain Tower', equipmentId: assets[3].id, contactPerson: 'Fatima Hassan', contactPhone: '+966 55 222 3344', preferredVisitDate: daysFromNow(21), createdById: techUsers[0]?.id || 'system' },
      { ticketNo: `CMP-${year}-000010`, type: 'quotation', category: 'it', priority: 'low', status: 'under_review', subject: 'Network upgrade quotation needed', description: 'Need quotation for upgrading the network infrastructure from 1Gbps to 10Gbps. Include new switches, cabling, and installation costs.', customerId: customers[4].id, siteId: sites[6].id, building: 'Admin Building', floor: 'Server Room', equipmentId: assets[5].id, contactPerson: 'Ali Al Dossari', contactPhone: '+966 50 777 8899', createdById: techUsers[0]?.id || 'system' },

      // Completed tickets
      { ticketNo: `CMP-${year}-000011`, type: 'complaint', category: 'plumbing', priority: 'high', status: 'closed', subject: 'Burst pipe in kitchen area', description: 'Burst pipe causing flooding in kitchen area of floor 3. Water spreading to corridor.', customerId: customers[2].id, siteId: sites[3].id, building: 'Food Court', floor: 'Floor 3', assignedTechnicianId: techProfiles[1]?.id, contactPerson: 'Khalid Al Madani', contactPhone: '+966 50 444 5566', responseDeadline: hoursAgo(-18), resolutionDeadline: hoursAgo(-10), actualResponseMinutes: 60, actualResolutionMinutes: 480, slaBreached: false, labourHours: 8, materialCost: 2500, serviceCost: 800, transportCost: 150, totalCost: 3450, customerApproved: true, customerApprovedAt: daysAgo(1), customerRating: 4, customerFeedback: 'Excellent work. Quick response and professional repair.', closedById: techUsers[0]?.id || 'system', closedAt: daysAgo(1), createdById: techUsers[0]?.id || 'system' },
      { ticketNo: `CMP-${year}-000012`, type: 'preventive_maintenance', category: 'air_conditioning', priority: 'preventive', status: 'closed', subject: 'Monthly AC filter cleaning', description: 'Monthly preventive maintenance: clean and replace AC filters in all 15 units.', customerId: customers[0].id, siteId: sites[0].id, building: 'Main Building', floor: 'All Floors', assignedTechnicianId: techProfiles[0]?.id, contactPerson: 'Ahmed Al Rashid', contactPhone: '+966 55 111 2233', labourHours: 6, materialCost: 450, serviceCost: 300, totalCost: 750, customerApproved: true, customerApprovedAt: daysAgo(5), customerRating: 5, customerFeedback: 'All units working perfectly after service.', closedById: techUsers[0]?.id || 'system', closedAt: daysAgo(5), createdById: techUsers[0]?.id || 'system' },
      { ticketNo: `CMP-${year}-000013`, type: 'complaint', category: 'security', priority: 'medium', status: 'closed', subject: 'CCTV camera offline - Gate 3', description: 'CCTV camera at Gate 3 is showing black screen. May be a connectivity issue or hardware failure.', customerId: customers[4].id, siteId: sites[6].id, building: 'Perimeter', equipmentId: assets[5].id, assignedTechnicianId: techProfiles[2]?.id, contactPerson: 'Ali Al Dossari', contactPhone: '+966 50 777 8899', labourHours: 3, materialCost: 800, serviceCost: 400, totalCost: 1200, customerApproved: true, customerApprovedAt: daysAgo(3), customerRating: 4, customerFeedback: 'Good repair. Camera is back online.', closedById: techUsers[0]?.id || 'system', closedAt: daysAgo(3), createdById: techUsers[0]?.id || 'system' },
    ]

    for (const ticket of ticketsData) {
      await prisma.maintenanceTicket.create({ data: ticket as any })
    }
    console.log('  ✅ 13 maintenance tickets created')

    // ============ TIMELINE ENTRIES ============
    console.log('📊 Creating timeline entries...')
    const tickets = await prisma.maintenanceTicket.findMany()

    const timelineData: { ticketId: string; action: string; description: string; performedById: string }[] = []

    for (const ticket of tickets) {
      timelineData.push({ ticketId: ticket.id, action: 'new', description: 'Ticket created', performedById: ticket.createdById })
      if (['assigned', 'accepted', 'in_progress', 'pending_parts', 'pending_customer', 'completed', 'customer_verification', 'closed'].includes(ticket.status)) {
        timelineData.push({ ticketId: ticket.id, action: 'under_review', description: 'Ticket under review', performedById: ticket.createdById })
      }
      if (ticket.assignedTechnicianId) {
        timelineData.push({ ticketId: ticket.id, action: 'assigned', description: `Assigned to ${ticket.assignedTechnicianId ? '' : 'technician'}`, performedById: ticket.createdById })
      }
      if (['in_progress', 'pending_parts', 'pending_customer', 'completed', 'customer_verification', 'closed'].includes(ticket.status)) {
        timelineData.push({ ticketId: ticket.id, action: 'in_progress', description: 'Work has started', performedById: ticket.assignedTechnicianId || ticket.createdById })
      }
      if (ticket.status === 'pending_customer') {
        timelineData.push({ ticketId: ticket.id, action: 'pending_customer', description: 'Work completed, awaiting customer verification', performedById: ticket.assignedTechnicianId || ticket.createdById })
      }
      if (ticket.status === 'closed') {
        timelineData.push({ ticketId: ticket.id, action: 'completed', description: 'Work completed successfully', performedById: ticket.assignedTechnicianId || ticket.createdById })
        timelineData.push({ ticketId: ticket.id, action: 'customer_verification', description: 'Customer verified and approved completion', performedById: ticket.createdById })
        timelineData.push({ ticketId: ticket.id, action: 'closed', description: 'Ticket closed', performedById: ticket.closedById || ticket.createdById })
      }
    }

    for (const entry of timelineData) {
      // Ensure performedById is a valid user
      const validUser = await prisma.user.findFirst({ where: { id: entry.performedById } })
      if (!validUser) {
        entry.performedById = techUsers.length > 0 ? techUsers[0].id : (await prisma.user.findFirst())?.id || ''
      }
      if (entry.performedById) {
        await prisma.maintenanceTimeline.create({ data: entry as any })
      }
    }
    console.log(`  ✅ ${timelineData.length} timeline entries created`)

    // ============ WORK ORDERS ============
    console.log('📋 Creating work orders...')
    const activeTickets = tickets.filter(t => ['in_progress', 'pending_customer', 'completed', 'closed'].includes(t.status) && t.assignedTechnicianId)

    const woData = activeTickets.map((t, i) => ({
      workOrderNo: `WO-${year}-${String(i + 1).padStart(6, '0')}`,
      ticketId: t.id,
      customerId: t.customerId,
      assignedTechnicianId: t.assignedTechnicianId,
      startDate: t.createdAt,
      targetCompletionDate: t.resolutionDeadline || daysFromNow(7),
      actualCompletionDate: t.status === 'closed' ? t.closedAt || new Date() : null,
      status: t.status === 'closed' ? 'completed' : 'in_progress',
      labourHours: t.labourHours,
      materialCost: t.materialCost,
      serviceCost: t.serviceCost,
      totalCost: t.totalCost,
      serviceNotes: `Service for ${t.subject}`,
      completionNotes: t.status === 'closed' ? 'All work completed successfully' : null,
      createdById: t.createdById,
    }))

    for (const wo of woData) {
      await prisma.maintenanceWorkOrder.create({ data: wo as any })
    }
    console.log(`  ✅ ${woData.length} work orders created`)

    // ============ AMC CONTRACTS ============
    console.log('📄 Creating AMC contracts...')
    const existingAMC = await prisma.aMCContract.count()
    if (existingAMC === 0) {
      await prisma.aMCContract.createMany({
        data: [
          { contractNo: `AMC-${year}-000001`, customerId: customers[0].id, name: 'Al Haramain Annual Maintenance', description: 'Comprehensive annual maintenance for HQ and Tower', startDate: daysAgo(180), endDate: daysFromNow(185), totalVisits: 48, usedVisits: 24, visitFrequency: 'monthly', coveredEquipment: JSON.stringify(['Central AC', 'Generator', 'Elevators', 'Fire Alarm', 'Plumbing System']), annualValue: 480000, slaPriority: 'high', status: 'active', autoRenew: true, createdById: techUsers[0]?.id || 'system' },
          { contractNo: `AMC-${year}-000002`, customerId: customers[2].id, name: 'Madinah Gate Mall Maintenance', description: 'Full facility maintenance including HVAC, electrical, plumbing, and cleaning', startDate: daysAgo(90), endDate: daysFromNow(275), totalVisits: 24, usedVisits: 6, visitFrequency: 'monthly', coveredEquipment: JSON.stringify(['HVAC System', 'Electrical', 'Plumbing', 'Cleaning', 'Fire Protection']), annualValue: 720000, slaPriority: 'medium', status: 'active', createdById: techUsers[0]?.id || 'system' },
          { contractNo: `AMC-${year}-000003`, customerId: customers[3].id, name: 'Red Sea Resort AMC', description: 'Resort maintenance including all villa systems', startDate: daysAgo(30), endDate: daysFromNow(335), totalVisits: 36, usedVisits: 3, visitFrequency: 'monthly', coveredEquipment: JSON.stringify(['AC Units', 'Plumbing', 'Electrical', 'Pool Equipment', 'Landscaping']), annualValue: 360000, slaPriority: 'medium', status: 'active', autoRenew: false, createdById: techUsers[0]?.id || 'system' },
        ],
      })
      console.log('  ✅ 3 AMC contracts created')
    }

    // ============ PM SCHEDULES ============
    console.log('📅 Creating PM schedules...')
    const existingPM = await prisma.pMSchedule.count()
    if (existingPM === 0) {
      await prisma.pMSchedule.createMany({
        data: [
          { scheduleNo: `PM-${year}-000001`, customerId: customers[0].id, siteId: sites[0].id, equipmentId: assets[0].id, scheduleType: 'monthly', frequencyMonths: 1, assignedTechnicianId: techProfiles[0]?.id, description: 'Monthly AC filter cleaning and inspection', lastVisitDate: daysAgo(15), nextVisitDate: daysFromNow(15), visitCount: 6, totalVisits: 12, isActive: true, autoGenerateWorkOrder: true, createdById: techUsers[0]?.id || 'system' },
          { scheduleNo: `PM-${year}-000002`, customerId: customers[0].id, siteId: sites[0].id, equipmentId: assets[1].id, scheduleType: 'quarterly', frequencyMonths: 3, assignedTechnicianId: techProfiles[1]?.id, description: 'Quarterly generator maintenance and load testing', lastVisitDate: daysAgo(30), nextVisitDate: daysFromNow(60), visitCount: 2, totalVisits: 4, isActive: true, autoGenerateWorkOrder: true, createdById: techUsers[0]?.id || 'system' },
          { scheduleNo: `PM-${year}-000003`, customerId: customers[2].id, siteId: sites[3].id, equipmentId: assets[2].id, scheduleType: 'semi_annual', frequencyMonths: 6, assignedTechnicianId: techProfiles[2]?.id, description: 'Semi-annual fire alarm system testing', lastVisitDate: daysAgo(90), nextVisitDate: daysFromNow(90), visitCount: 1, totalVisits: 2, isActive: true, autoGenerateWorkOrder: true, createdById: techUsers[0]?.id || 'system' },
          { scheduleNo: `PM-${year}-000004`, customerId: customers[1].id, siteId: sites[2].id, equipmentId: assets[3].id, scheduleType: 'annual', frequencyMonths: 12, assignedTechnicianId: techProfiles[3]?.id, description: 'Annual elevator safety inspection and certification', lastVisitDate: daysAgo(180), nextVisitDate: daysFromNow(185), visitCount: 0, totalVisits: 1, isActive: true, autoGenerateWorkOrder: true, createdById: techUsers[0]?.id || 'system' },
          { scheduleNo: `PM-${year}-000005`, customerId: customers[4].id, siteId: sites[6].id, scheduleType: 'monthly', frequencyMonths: 1, assignedTechnicianId: techProfiles[4]?.id, description: 'Monthly CCTV and security system check', lastVisitDate: daysAgo(25), nextVisitDate: daysFromNow(5), visitCount: 7, totalVisits: 12, isActive: true, autoGenerateWorkOrder: true, createdById: techUsers[0]?.id || 'system' },
        ],
      })
      console.log('  ✅ 5 PM schedules created')
    }

    // ============ MATERIAL REQUESTS ============
    console.log('📦 Creating material requests...')
    const existingMR = await prisma.materialRequest.count()
    if (existingMR === 0) {
      await prisma.materialRequest.createMany({
        data: [
          { requestNo: `MR-${year}-000001`, workOrderId: woData[0]?.id, ticketId: tickets[0]?.id, requestedById: techUsers[0]?.id || 'system', items: JSON.stringify([{ name: 'AC Compressor', quantity: 1, unit: 'piece', requestedQty: 1, issuedQty: 1, notes: 'Replacement compressor' }, { name: 'Refrigerant Gas R410A', quantity: 2, unit: 'can', requestedQty: 2, issuedQty: 2, notes: 'For recharge' }]), totalCost: 3500, status: 'issued', issuedById: techUsers[0]?.id || 'system', issuedAt: daysAgo(1), notes: 'Urgent parts for server room AC', createdById: techUsers[0]?.id || 'system' },
          { requestNo: `MR-${year}-000002`, ticketId: tickets[2]?.id, requestedById: techUsers[1]?.id || 'system', items: JSON.stringify([{ name: 'Copper Pipe 1 inch', quantity: 5, unit: 'meter', requestedQty: 5, issuedQty: 3, notes: 'For pipe repair' }, { name: 'Pipe Fittings Set', quantity: 1, unit: 'set', requestedQty: 1, issuedQty: 1, notes: 'Various fittings' }, { name: 'Sealant Tape', quantity: 3, unit: 'roll', requestedQty: 3, issuedQty: 0, notes: 'TPFE tape' }]), totalCost: 850, status: 'partially_issued', notes: 'Partial issue - sealant tape on backorder', createdById: techUsers[1]?.id || 'system' },
          { requestNo: `MR-${year}-000003`, ticketId: tickets[6]?.id, requestedById: techUsers[0]?.id || 'system', items: JSON.stringify([{ name: 'AC Filter 24x24', quantity: 4, unit: 'piece', requestedQty: 4, issuedQty: 0, notes: 'Replacement filters' }]), totalCost: 200, status: 'requested', createdById: techUsers[0]?.id || 'system' },
        ],
      })
      console.log('  ✅ 3 material requests created')
    }

    // ============ SERVICE RATINGS ============
    console.log('⭐ Creating service ratings...')
    const closedTickets = tickets.filter(t => t.status === 'closed' && t.customerRating)
    for (const t of closedTickets) {
      if (t.customerRating) {
        await prisma.serviceRating.create({
          data: {
            ticketId: t.id,
            customerId: t.customerId || undefined,
            technicianId: t.assignedTechnicianId || undefined,
            rating: t.customerRating,
            punctuality: Math.min(5, t.customerRating + Math.floor(Math.random() * 2)),
            quality: Math.min(5, t.customerRating + Math.floor(Math.random() * 2)),
            professionalism: Math.min(5, t.customerRating + Math.floor(Math.random() * 2)),
            overallScore: t.customerRating * 1.0,
            feedback: t.customerFeedback || undefined,
          },
        })
      }
    }
    console.log(`  ✅ ${closedTickets.length} service ratings created`)

    // ============ MAINTENANCE INVOICES ============
    console.log('💰 Creating maintenance invoices...')
    const existingInvoices = await prisma.maintenanceInvoice.count()
    if (existingInvoices === 0) {
      const closedTicketsWithCost = tickets.filter(t => t.status === 'closed' && t.totalCost > 0)
      for (let i = 0; i < closedTicketsWithCost.length; i++) {
        const t = closedTicketsWithCost[i]
        await prisma.maintenanceInvoice.create({
          data: {
            invoiceNo: `MIV-${year}-${String(i + 1).padStart(6, '0')}`,
            ticketId: t.id,
            customerId: t.customerId!,
            labourCost: t.labourHours * 150,
            materialCost: t.materialCost,
            transportCost: t.transportCost,
            serviceCharges: t.serviceCost,
            tax: (t.labourHours * 150 + t.materialCost + t.transportCost + t.serviceCost) * 0.15,
            discount: 0,
            total: t.labourHours * 150 + t.materialCost + t.transportCost + t.serviceCost + (t.labourHours * 150 + t.materialCost + t.transportCost + t.serviceCost) * 0.15,
            status: i === 0 ? 'paid' : i === 1 ? 'sent' : 'draft',
            paidAmount: i === 0 ? t.totalCost + (t.totalCost * 0.15) : 0,
            notes: `Invoice for ${t.subject}`,
            issuedById: techUsers[0]?.id || 'system',
          },
        })
      }
      console.log(`  ✅ ${closedTicketsWithCost.length} maintenance invoices created`)
    }
  }

  console.log('\n✅ Maintenance Management System seeding complete!')
  console.log('  - 4 SLA Templates')
  console.log('  - 5+ Customers')
  console.log('  - 8 Maintenance Sites')
  console.log('  - 5 Technician Profiles')
  console.log('  - 6+ Assets')
  console.log('  - 13 Maintenance Tickets')
  console.log('  - Timeline Entries')
  console.log('  - Work Orders')
  console.log('  - 3 AMC Contracts')
  console.log('  - 5 PM Schedules')
  console.log('  - 3 Material Requests')
  console.log('  - Service Ratings')
  console.log('  - Maintenance Invoices')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

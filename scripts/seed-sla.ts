/**
 * SLA, Sites & WhatsApp Templates Seed — run: bun run scripts/seed-sla.ts
 */
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function seed() {
  console.log('Seeding SLA templates, maintenance sites, and WhatsApp templates...')

  // Seed SLA templates
  const slaCount = await prisma.sLATemplate.count()
  if (slaCount === 0) {
    const slas = [
      { priority: 'emergency', label: 'Emergency Response', responseTimeMinutes: 120, resolutionTimeMinutes: 240, escalationAfterMinutes: 60 },
      { priority: 'high', label: 'High Priority', responseTimeMinutes: 240, resolutionTimeMinutes: 480, escalationAfterMinutes: 120 },
      { priority: 'medium', label: 'Medium Priority', responseTimeMinutes: 1440, resolutionTimeMinutes: 2880, escalationAfterMinutes: 360 },
      { priority: 'low', label: 'Low Priority', responseTimeMinutes: 4320, resolutionTimeMinutes: 10080, escalationAfterMinutes: 720 },
    ]
    for (const sla of slas) {
      await prisma.sLATemplate.create({ data: sla })
    }
    console.log(`Created ${slas.length} SLA templates`)
  } else {
    console.log(`SLA templates already exist (${slaCount})`)
  }

  // Seed maintenance sites
  const siteCount = await prisma.maintenanceSite.count()
  if (siteCount === 0) {
    const sites = [
      { name: 'Head Office', code: 'HO-001', address: 'Bandar Seri Begawan', city: 'Bandar Seri Begawan', phone: '+673-222-0001' },
      { name: 'Gadong Branch', code: 'GD-001', address: 'Gadong', city: 'Bandar Seri Begawan', phone: '+673-222-0002' },
    ]
    for (const site of sites) {
      await prisma.maintenanceSite.create({ data: site })
    }
    console.log(`Created ${sites.length} maintenance sites`)
  } else {
    console.log(`Maintenance sites already exist (${siteCount})`)
  }

  // Seed WhatsApp message templates
  const tplCount = await prisma.whatsAppMessageTemplate.count()
  if (tplCount === 0) {
    const templates = [
      { name: 'Complaint Received', content: '✅ *Complaint Registered*\nTicket: {{ticketNo}}\nStatus: New\nCategory: {{category}}\nPriority: {{priority}}\n\n_Our team will review shortly._', category: 'utility', language: 'en', variables: JSON.stringify(['ticketNo', 'category', 'priority']) },
      { name: 'Technician Assigned', content: '👷 *Technician Assigned*\nTicket: {{ticketNo}}\nTechnician: {{technicianName}}\nVisit Time: {{visitTime}}\n\n_Please be available at the location._', category: 'utility', language: 'en', variables: JSON.stringify(['ticketNo', 'technicianName', 'visitTime']) },
      { name: 'Work Completed', content: '✅ *Work Completed*\nTicket: {{ticketNo}}\nTechnician: {{technicianName}}\nCompletion Time: {{completionTime}}\n\n_Please rate our service._', category: 'utility', language: 'en', variables: JSON.stringify(['ticketNo', 'technicianName', 'completionTime']) },
      { name: 'Status Update', content: '📋 *Status Update*\nTicket: {{ticketNo}}\nStatus: {{status}}\nUpdate: {{update}}', category: 'utility', language: 'en', variables: JSON.stringify(['ticketNo', 'status', 'update']) },
    ]
    for (const tpl of templates) {
      await prisma.whatsAppMessageTemplate.create({ data: tpl })
    }
    console.log(`Created ${templates.length} WhatsApp templates`)
  } else {
    console.log(`WhatsApp templates already exist (${tplCount})`)
  }

  console.log('Seeding complete!')
}

seed().catch(console.error).finally(() => prisma.$disconnect())

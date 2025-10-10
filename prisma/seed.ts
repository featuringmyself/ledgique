import { PrismaClient, ClientStatus, ProjectStatus, Priority, NoteType, NotePriority, NoteStatus } from '@/app/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  const clerkUserIds = [
    'user_32QrZJaFb0lghQn40GMG9w7Y0qT',
    'user_3mLkIfHaYZA234BCD',
    'user_4nMlJgIbZAB345CDE'
  ];

  // Create Client Sources
  const clientSources = await Promise.all([
    prisma.clientSource.upsert({ where: { name_clerkId: { name: 'Google Ads', clerkId: clerkUserIds[0] } }, update: {}, create: { name: 'Google Ads', clerkId: clerkUserIds[0] } }),
    prisma.clientSource.upsert({ where: { name_clerkId: { name: 'LinkedIn', clerkId: clerkUserIds[0] } }, update: {}, create: { name: 'LinkedIn', clerkId: clerkUserIds[0] } }),
    prisma.clientSource.upsert({ where: { name_clerkId: { name: 'Referral', clerkId: clerkUserIds[0] } }, update: {}, create: { name: 'Referral', clerkId: clerkUserIds[0] } }),
    prisma.clientSource.upsert({ where: { name_clerkId: { name: 'Website', clerkId: clerkUserIds[0] } }, update: {}, create: { name: 'Website', clerkId: clerkUserIds[0] } }),
    prisma.clientSource.upsert({ where: { name_clerkId: { name: 'Social Media', clerkId: clerkUserIds[0] } }, update: {}, create: { name: 'Social Media', clerkId: clerkUserIds[0] } }),
  ]);

  console.log('📊 Created client sources');

  // Create Clients - distributed across last 12 months
  const clients = [];
  const now = new Date();
  
  const clientData = [
    { name: 'TechCorp Solutions', company: 'TechCorp Inc.', email: ['contact@techcorp.com'], phone: ['+1-555-0123'], address: '123 Tech Street, Silicon Valley, CA 94000', website: 'https://techcorp.com', clientNotes: 'Long-term client, prefers agile methodology.', clientSourceId: clientSources[0].id, status: ClientStatus.ACTIVE, clerkId: clerkUserIds[0] },
    { name: 'GreenEarth Initiative', company: 'GreenEarth Foundation', email: ['info@greenearth.org'], phone: ['+1-555-0234'], address: '456 Eco Lane, Portland, OR 97200', website: 'https://greenearth.org', clientNotes: 'Non-profit organization focused on environmental projects.', clientSourceId: clientSources[1].id, status: ClientStatus.ACTIVE, clerkId: clerkUserIds[0] },
    { name: 'RetailMax Chain', company: 'RetailMax Corporation', email: ['business@retailmax.com'], phone: ['+1-555-0345'], address: '789 Commerce Blvd, New York, NY 10001', website: 'https://retailmax.com', clientNotes: 'Large retail chain looking to modernize their systems.', clientSourceId: clientSources[2].id, status: ClientStatus.ACTIVE, clerkId: clerkUserIds[0] },
    { name: 'StartupXYZ', company: 'StartupXYZ Ltd.', email: ['hello@startupxyz.com'], phone: ['+1-555-0456'], address: '321 Innovation Ave, Austin, TX 78701', website: 'https://startupxyz.com', clientNotes: 'Fast-moving startup, needs quick turnaround.', clientSourceId: clientSources[3].id, status: ClientStatus.ACTIVE, clerkId: clerkUserIds[0] },
    { name: 'HealthTech Innovations', company: 'HealthTech Medical Solutions', email: ['contact@healthtech.com'], phone: ['+1-555-0678'], address: '890 Medical Center Dr, Houston, TX 77030', website: 'https://healthtech-innovations.com', clientNotes: 'Healthcare technology company. Requires HIPAA compliance.', clientSourceId: clientSources[4].id, status: ClientStatus.ACTIVE, clerkId: clerkUserIds[0] },
    { name: 'FinanceFlow Pro', company: 'FinanceFlow Solutions', email: ['admin@financeflow.com'], phone: ['+1-555-0789'], address: '567 Wall Street, New York, NY 10005', website: 'https://financeflow.com', clientNotes: 'Financial services company requiring secure solutions.', clientSourceId: clientSources[0].id, status: ClientStatus.ACTIVE, clerkId: clerkUserIds[0] },
    { name: 'EduTech Academy', company: 'EduTech Learning Systems', email: ['info@edutech.edu'], phone: ['+1-555-0890'], address: '234 Education Blvd, Boston, MA 02101', website: 'https://edutech-academy.com', clientNotes: 'Educational technology platform for K-12 schools.', clientSourceId: clientSources[1].id, status: ClientStatus.ACTIVE, clerkId: clerkUserIds[0] },
    { name: 'FoodieDelight', company: 'FoodieDelight Restaurants', email: ['orders@foodiedelight.com'], phone: ['+1-555-0901'], address: '678 Culinary Ave, Los Angeles, CA 90210', website: 'https://foodiedelight.com', clientNotes: 'Restaurant chain needing online ordering system.', clientSourceId: clientSources[2].id, status: ClientStatus.ACTIVE, clerkId: clerkUserIds[0] },
    { name: 'AutoMotive Plus', company: 'AutoMotive Plus Dealerships', email: ['sales@automotiveplus.com'], phone: ['+1-555-1012'], address: '890 Motor Way, Detroit, MI 48201', website: 'https://automotiveplus.com', clientNotes: 'Car dealership network requiring inventory management.', clientSourceId: clientSources[3].id, status: ClientStatus.ACTIVE, clerkId: clerkUserIds[0] },
    { name: 'RealEstate Pro', company: 'RealEstate Pro Agency', email: ['listings@realestatepro.com'], phone: ['+1-555-1123'], address: '345 Property Lane, Miami, FL 33101', website: 'https://realestatepro.com', clientNotes: 'Real estate agency needing property management system.', clientSourceId: clientSources[4].id, status: ClientStatus.ACTIVE, clerkId: clerkUserIds[0] },
    { name: 'FitnessFirst Gyms', company: 'FitnessFirst Health Centers', email: ['membership@fitnessfirst.com'], phone: ['+1-555-1234'], address: '456 Wellness St, Denver, CO 80201', website: 'https://fitnessfirst.com', clientNotes: 'Gym chain requiring membership management system.', clientSourceId: clientSources[0].id, status: ClientStatus.ACTIVE, clerkId: clerkUserIds[0] },
    { name: 'TravelBug Adventures', company: 'TravelBug Tourism', email: ['bookings@travelbug.com'], phone: ['+1-555-1345'], address: '789 Adventure Rd, Seattle, WA 98101', website: 'https://travelbug.com', clientNotes: 'Travel agency needing booking and itinerary system.', clientSourceId: clientSources[1].id, status: ClientStatus.ACTIVE, clerkId: clerkUserIds[0] },
  ];

  // Create clients with even distribution across last 12 months
  for (let i = 0; i < clientData.length; i++) {
    const monthsAgo = i % 12; // Distribute evenly across 12 months
    const createdAt = new Date(now.getFullYear(), now.getMonth() - monthsAgo, Math.floor(Math.random() * 28) + 1);
    
    const client = await prisma.client.create({
      data: {
        ...clientData[i],
        createdAt,
        updatedAt: createdAt,
      },
    });
    clients.push(client);
  }

  console.log('🏢 Created clients');

  // Create Projects - distributed across last 12 months
  const projects = [];
  
  const projectData = [
    { name: 'E-commerce Platform Redesign', description: 'Complete redesign and development of the client\'s e-commerce platform.', clientId: clients[0].id, clerkId: clerkUserIds[0], deliverables: ['UI/UX Design', 'Frontend Development', 'Backend API', 'Payment Integration'], status: ProjectStatus.COMPLETED, priority: Priority.HIGH, budget: 85000.00, tags: ['web-development', 'e-commerce', 'react', 'nodejs'] },
    { name: 'Environmental Data Dashboard', description: 'Interactive dashboard to visualize environmental data.', clientId: clients[1].id, clerkId: clerkUserIds[0], deliverables: ['Data Analysis', 'Dashboard Design', 'Data Visualization', 'Real-time Integration'], status: ProjectStatus.COMPLETED, priority: Priority.MEDIUM, budget: 45000.00, tags: ['dashboard', 'data-visualization', 'environmental', 'react'] },
    { name: 'Retail Inventory Management System', description: 'Complete inventory management solution for retail chain.', clientId: clients[2].id, clerkId: clerkUserIds[0], deliverables: ['System Architecture', 'Database Design', 'API Development', 'Mobile App'], status: ProjectStatus.COMPLETED, priority: Priority.HIGH, budget: 120000.00, tags: ['inventory', 'retail', 'mobile', 'api'] },
    { name: 'Startup MVP Development', description: 'Minimum viable product development for tech startup.', clientId: clients[3].id, clerkId: clerkUserIds[0], deliverables: ['MVP Design', 'Core Features', 'User Authentication', 'Deployment'], status: ProjectStatus.COMPLETED, priority: Priority.HIGH, budget: 65000.00, tags: ['mvp', 'startup', 'react', 'firebase'] },
    { name: 'Healthcare HIPAA Compliance System', description: 'HIPAA compliant patient management system.', clientId: clients[4].id, clerkId: clerkUserIds[0], deliverables: ['Security Audit', 'Compliance Implementation', 'Patient Portal', 'Staff Training'], status: ProjectStatus.COMPLETED, priority: Priority.HIGH, budget: 95000.00, tags: ['healthcare', 'hipaa', 'security', 'compliance'] },
    { name: 'Financial Trading Platform', description: 'Real-time trading platform with advanced analytics.', clientId: clients[5].id, clerkId: clerkUserIds[0], deliverables: ['Trading Engine', 'Real-time Data', 'Analytics Dashboard', 'Mobile App'], status: ProjectStatus.COMPLETED, priority: Priority.HIGH, budget: 150000.00, tags: ['fintech', 'trading', 'real-time', 'analytics'] },
    { name: 'Educational Learning Management System', description: 'Comprehensive LMS for K-12 education.', clientId: clients[6].id, clerkId: clerkUserIds[0], deliverables: ['Course Management', 'Student Portal', 'Teacher Dashboard', 'Parent Access'], status: ProjectStatus.COMPLETED, priority: Priority.MEDIUM, budget: 75000.00, tags: ['education', 'lms', 'k12', 'portal'] },
    { name: 'Restaurant Online Ordering System', description: 'Multi-location online ordering and delivery system.', clientId: clients[7].id, clerkId: clerkUserIds[0], deliverables: ['Online Menu', 'Order Management', 'Payment Processing', 'Delivery Tracking'], status: ProjectStatus.COMPLETED, priority: Priority.MEDIUM, budget: 55000.00, tags: ['restaurant', 'ordering', 'delivery', 'payments'] },
    { name: 'Automotive Inventory Management', description: 'Vehicle inventory and sales management system.', clientId: clients[8].id, clerkId: clerkUserIds[0], deliverables: ['Inventory Tracking', 'Sales Pipeline', 'Customer CRM', 'Reporting'], status: ProjectStatus.IN_PROGRESS, priority: Priority.MEDIUM, budget: 80000.00, tags: ['automotive', 'inventory', 'crm', 'sales'] },
    { name: 'Real Estate Property Management', description: 'Comprehensive property listing and management platform.', clientId: clients[9].id, clerkId: clerkUserIds[0], deliverables: ['Property Listings', 'Client Portal', 'Document Management', 'Virtual Tours'], status: ProjectStatus.COMPLETED, priority: Priority.MEDIUM, budget: 70000.00, tags: ['real-estate', 'property', 'listings', 'virtual-tours'] },
    { name: 'Gym Membership Management System', description: 'Complete gym management with member tracking.', clientId: clients[10].id, clerkId: clerkUserIds[0], deliverables: ['Member Portal', 'Class Scheduling', 'Payment Processing', 'Fitness Tracking'], status: ProjectStatus.IN_PROGRESS, priority: Priority.LOW, budget: 45000.00, tags: ['fitness', 'membership', 'scheduling', 'payments'] },
    { name: 'Travel Booking Platform', description: 'Multi-service travel booking and itinerary management.', clientId: clients[11].id, clerkId: clerkUserIds[0], deliverables: ['Booking Engine', 'Itinerary Builder', 'Payment Gateway', 'Mobile App'], status: ProjectStatus.COMPLETED, priority: Priority.HIGH, budget: 90000.00, tags: ['travel', 'booking', 'itinerary', 'mobile'] },
  ];

  // Create projects with even distribution across last 12 months
  for (let i = 0; i < projectData.length; i++) {
    const monthsAgo = i % 12; // Distribute evenly across 12 months
    const createdAt = new Date(now.getFullYear(), now.getMonth() - monthsAgo, Math.floor(Math.random() * 28) + 1);
    const startDate = new Date(createdAt.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);
    const endDate = new Date(startDate.getTime() + (30 + Math.random() * 120) * 24 * 60 * 60 * 1000);
    
    const project = await prisma.project.create({
      data: {
        ...projectData[i],
        startDate,
        endDate,
        createdAt,
        updatedAt: createdAt,
      },
    });
    projects.push(project);
  }

  console.log('📋 Created projects');

  // Create Notes - distributed across last 6 months
  const notes = [];
  
  const noteData = [
    // General Notes
    { title: 'Weekly Team Meeting Notes', content: 'Discussed project priorities and upcoming deadlines. Need to focus on TechCorp Solutions e-commerce platform completion.', type: NoteType.MEETING_NOTES, priority: NotePriority.MEDIUM, status: NoteStatus.ACTIVE, tags: ['meeting', 'team', 'priorities'], clientId: clients[0].id, projectId: projects[0].id, clerkId: clerkUserIds[0] },
    { title: 'Client Communication - GreenEarth', content: 'Follow-up call with GreenEarth about dashboard requirements. They want real-time data updates and mobile responsiveness.', type: NoteType.CLIENT_COMMUNICATION, priority: NotePriority.HIGH, status: NoteStatus.ACTIVE, tags: ['client', 'requirements', 'mobile'], clientId: clients[1].id, projectId: projects[1].id, clerkId: clerkUserIds[0] },
    { title: 'Project Documentation Update', content: 'Updated project documentation for RetailMax inventory system. Added new API endpoints and database schema changes.', type: NoteType.PROJECT_NOTES, priority: NotePriority.MEDIUM, status: NoteStatus.COMPLETED, tags: ['documentation', 'api', 'database'], clientId: clients[2].id, projectId: projects[2].id, clerkId: clerkUserIds[0] },
    
    // Todo Items
    { title: 'Review StartupXYZ MVP Code', content: 'Need to review the MVP code before final deployment. Check for security vulnerabilities and performance issues.', type: NoteType.TODO, priority: NotePriority.HIGH, status: NoteStatus.ACTIVE, tags: ['code-review', 'security', 'performance'], clientId: clients[3].id, projectId: projects[3].id, clerkId: clerkUserIds[0], dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
    { title: 'HIPAA Compliance Audit', content: 'Schedule HIPAA compliance audit for HealthTech system. Need to prepare documentation and coordinate with compliance team.', type: NoteType.TODO, priority: NotePriority.URGENT, status: NoteStatus.ACTIVE, tags: ['hipaa', 'compliance', 'audit'], clientId: clients[4].id, projectId: projects[4].id, clerkId: clerkUserIds[0], dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    { title: 'Update Financial Trading Platform', content: 'Update trading platform with new market data feeds and improve analytics dashboard performance.', type: NoteType.TODO, priority: NotePriority.MEDIUM, status: NoteStatus.ACTIVE, tags: ['trading', 'analytics', 'performance'], clientId: clients[5].id, projectId: projects[5].id, clerkId: clerkUserIds[0], dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
    
    // Deliverables
    { title: 'Educational LMS User Manual', content: 'Create comprehensive user manual for teachers and students using the educational LMS platform.', type: NoteType.DELIVERABLE, priority: NotePriority.MEDIUM, status: NoteStatus.ACTIVE, tags: ['documentation', 'user-manual', 'education'], clientId: clients[6].id, projectId: projects[6].id, clerkId: clerkUserIds[0], dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) },
    { title: 'Restaurant Ordering System Testing', content: 'Complete end-to-end testing of the restaurant ordering system across all locations.', type: NoteType.DELIVERABLE, priority: NotePriority.HIGH, status: NoteStatus.ACTIVE, tags: ['testing', 'restaurant', 'ordering'], clientId: clients[7].id, projectId: projects[7].id, clerkId: clerkUserIds[0], dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
    { title: 'Automotive Inventory Reports', content: 'Generate monthly inventory reports and sales analytics for AutoMotive Plus dealerships.', type: NoteType.DELIVERABLE, priority: NotePriority.LOW, status: NoteStatus.ACTIVE, tags: ['reports', 'inventory', 'analytics'], clientId: clients[8].id, projectId: projects[8].id, clerkId: clerkUserIds[0], dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000) },
    
    // Personal Notes
    { title: 'Professional Development Plan', content: 'Plan for upcoming professional development activities. Consider attending React conference and learning new database technologies.', type: NoteType.PERSONAL, priority: NotePriority.LOW, status: NoteStatus.ACTIVE, tags: ['development', 'learning', 'conference'], clerkId: clerkUserIds[0] },
    { title: 'Team Building Ideas', content: 'Research team building activities for the development team. Consider virtual events and in-person meetups.', type: NoteType.PERSONAL, priority: NotePriority.LOW, status: NoteStatus.ACTIVE, tags: ['team-building', 'team', 'activities'], clerkId: clerkUserIds[0] },
    
    // General Notes
    { title: 'Technology Stack Evaluation', content: 'Evaluate new technology stack options for upcoming projects. Consider Next.js 14, Prisma updates, and new deployment strategies.', type: NoteType.GENERAL, priority: NotePriority.MEDIUM, status: NoteStatus.ACTIVE, tags: ['technology', 'evaluation', 'stack'], clerkId: clerkUserIds[0] },
    { title: 'Client Feedback Summary', content: 'Compile feedback from recent client meetings. Common themes: faster delivery, better communication, more detailed documentation.', type: NoteType.GENERAL, priority: NotePriority.MEDIUM, status: NoteStatus.COMPLETED, tags: ['feedback', 'clients', 'improvement'], clerkId: clerkUserIds[0] },
  ];

  // Create notes with even distribution across last 6 months
  for (let i = 0; i < noteData.length; i++) {
    const monthsAgo = i % 6; // Distribute evenly across 6 months
    const createdAt = new Date(now.getFullYear(), now.getMonth() - monthsAgo, Math.floor(Math.random() * 28) + 1);
    
    const note = await prisma.note.create({
      data: {
        ...noteData[i],
        createdAt,
        updatedAt: createdAt,
      },
    });
    notes.push(note);
  }

  console.log('📝 Created notes');

  const clientCount = await prisma.client.count();
  const projectCount = await prisma.project.count();
  const noteCount = await prisma.note.count();

  console.log('\n🎉 Database seeding completed successfully!');
  console.log(`📊 Summary:`);
  console.log(`   Clients: ${clientCount}`);
  console.log(`   Projects: ${projectCount}`);
  console.log(`   Notes: ${noteCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
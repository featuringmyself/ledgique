import { PrismaClient, ClientStatus, ProjectStatus, Priority, PaymentType, PaymentMethod, PaymentStatus } from '@/app/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.payment.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.clientSource.deleteMany();

  console.log('🧹 Cleared existing data');

  // Sample clerk user IDs
  const clerkUserIds = [
    'user_2nKjHfGzXYZ123ABC',
    'user_3mLkIfHaYZA234BCD',
    'user_4nMlJgIbZAB345CDE'
  ];

  // Create Client Sources
  const clientSources = await Promise.all([
    prisma.clientSource.create({ data: { name: 'Google', clerkId: clerkUserIds[0] } }),
    prisma.clientSource.create({ data: { name: 'LinkedIn', clerkId: clerkUserIds[0] } }),
    prisma.clientSource.create({ data: { name: 'Referral', clerkId: clerkUserIds[0] } }),
    prisma.clientSource.create({ data: { name: 'Website', clerkId: clerkUserIds[0] } }),
    prisma.clientSource.create({ data: { name: 'Social Media', clerkId: clerkUserIds[0] } }),
  ]);

  console.log('📊 Created client sources');

  // Create Clients
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        name: 'TechCorp Solutions',
        company: 'TechCorp Inc.',
        email: ['contact@techcorp.com'],
        phone: ['+1-555-0123'],
        address: '123 Tech Street, Silicon Valley, CA 94000',
        website: 'https://techcorp.com',
        notes: 'Long-term client, prefers agile methodology.',
        clientSourceId: clientSources[0].id,
        status: ClientStatus.ACTIVE,
        clerkId: clerkUserIds[0],
      },
    }),
    prisma.client.create({
      data: {
        name: 'GreenEarth Initiative',
        company: 'GreenEarth Foundation',
        email: ['info@greenearth.org'],
        phone: ['+1-555-0234'],
        address: '456 Eco Lane, Portland, OR 97200',
        website: 'https://greenearth.org',
        notes: 'Non-profit organization focused on environmental projects.',
        clientSourceId: clientSources[1].id,
        status: ClientStatus.ACTIVE,
        clerkId: clerkUserIds[0],
      },
    }),
    prisma.client.create({
      data: {
        name: 'RetailMax Chain',
        company: 'RetailMax Corporation',
        email: ['business@retailmax.com'],
        phone: ['+1-555-0345'],
        address: '789 Commerce Blvd, New York, NY 10001',
        website: 'https://retailmax.com',
        notes: 'Large retail chain looking to modernize their systems.',
        clientSourceId: clientSources[2].id,
        status: ClientStatus.ACTIVE,
        clerkId: clerkUserIds[0],
      },
    }),
    prisma.client.create({
      data: {
        name: 'StartupXYZ',
        company: 'StartupXYZ Ltd.',
        email: ['hello@startupxyz.com'],
        phone: ['+1-555-0456'],
        address: '321 Innovation Ave, Austin, TX 78701',
        website: 'https://startupxyz.com',
        notes: 'Fast-moving startup, needs quick turnaround.',
        clientSourceId: clientSources[3].id,
        status: ClientStatus.ACTIVE,
        clerkId: clerkUserIds[0],
      },
    }),
    prisma.client.create({
      data: {
        name: 'HealthTech Innovations',
        company: 'HealthTech Medical Solutions',
        email: ['contact@healthtech.com'],
        phone: ['+1-555-0678'],
        address: '890 Medical Center Dr, Houston, TX 77030',
        website: 'https://healthtech-innovations.com',
        notes: 'Healthcare technology company. Requires HIPAA compliance.',
        clientSourceId: clientSources[4].id,
        status: ClientStatus.ACTIVE,
        clerkId: clerkUserIds[0],
      },
    }),
  ]);

  console.log('🏢 Created clients');

  // Create Projects
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: 'E-commerce Platform Redesign',
        description: 'Complete redesign and development of the client\'s e-commerce platform.',
        clientId: clients[0].id,
        clerkId: clerkUserIds[0],
        deliverables: ['UI/UX Design', 'Frontend Development', 'Backend API', 'Payment Integration'],
        status: ProjectStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        startDate: new Date('2024-08-01'),
        endDate: new Date('2024-12-15'),
        budget: 85000.00,
        tags: ['web-development', 'e-commerce', 'react', 'nodejs'],
      },
    }),
    prisma.project.create({
      data: {
        name: 'Environmental Data Dashboard',
        description: 'Interactive dashboard to visualize environmental data.',
        clientId: clients[1].id,
        clerkId: clerkUserIds[0],
        deliverables: ['Data Analysis', 'Dashboard Design', 'Data Visualization', 'Real-time Integration'],
        status: ProjectStatus.IN_PROGRESS,
        priority: Priority.MEDIUM,
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-01-31'),
        budget: 45000.00,
        tags: ['dashboard', 'data-visualization', 'environmental', 'react'],
      },
    }),
  ]);

  console.log('📋 Created projects');

  // Create Payments
  const payments = await Promise.all([
    prisma.payment.create({
      data: {
        amount: 25500.00,
        date: new Date('2024-12-05'),
        description: 'Project milestone payment',
        type: PaymentType.MILESTONE,
        method: PaymentMethod.BANK_TRANSFER,
        status: PaymentStatus.COMPLETED,
        projectId: projects[0].id,
        clientId: clients[0].id,
      },
    }),
    prisma.payment.create({
      data: {
        amount: 13500.00,
        date: new Date('2024-12-08'),
        description: 'Dashboard development payment',
        type: PaymentType.ADVANCE,
        method: PaymentMethod.STRIPE,
        status: PaymentStatus.COMPLETED,
        projectId: projects[1].id,
        clientId: clients[1].id,
      },
    }),
  ]);

  console.log('💳 Created payments');

  const clientCount = await prisma.client.count();
  const projectCount = await prisma.project.count();
  const paymentCount = await prisma.payment.count();
  const sourceCount = await prisma.clientSource.count();

  console.log('\n🎉 Database seeding completed successfully!');
  console.log(`📊 Summary:`);
  console.log(`   Client Sources: ${sourceCount}`);
  console.log(`   Clients: ${clientCount}`);
  console.log(`   Projects: ${projectCount}`);
  console.log(`   Payments: ${paymentCount}`);
  console.log('\n✨ Your database is now populated with dynamic client sources!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
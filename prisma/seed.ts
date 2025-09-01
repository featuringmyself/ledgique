import { PrismaClient, ClientStatus, ProjectStatus, Priority } from '@/app/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleared existing data');

  // Create Users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.doe@example.com',
        clerkId: 'clerk_user_1',
        name: 'John Doe',
        role: 'ADMIN',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
      },
    }),
    prisma.user.create({
      data: {
        email: 'sarah.wilson@example.com',
        clerkId: 'clerk_user_2',
        name: 'Sarah Wilson',
        role: 'PROJECT_MANAGER',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      },
    }),
    prisma.user.create({
      data: {
        email: 'mike.chen@example.com',
        clerkId: 'clerk_user_3',
        name: 'Mike Chen',
        role: 'DEVELOPER',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
      },
    }),
    prisma.user.create({
      data: {
        email: 'emma.garcia@example.com',
        clerkId: 'clerk_user_4',
        name: 'Emma Garcia',
        role: 'DESIGNER',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
      },
    }),
  ]);

  console.log('👥 Created users');

  // Create Clients
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        name: 'TechCorp Solutions',
        company: 'TechCorp Inc.',
        email: ['contact@techcorp.com', 'projects@techcorp.com'],
        phone: ['+1-555-0123', '+1-555-0124'],
        address: '123 Tech Street, Silicon Valley, CA 94000',
        website: 'https://techcorp.com',
        notes: 'Long-term client, prefers agile methodology. Regular monthly meetings.',
        status: ClientStatus.ACTIVE,
        userId: users[0].id,
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
        notes: 'Non-profit organization focused on environmental projects. Budget-conscious.',
        status: ClientStatus.ACTIVE,
        userId: users[1].id,
      },
    }),
    prisma.client.create({
      data: {
        name: 'RetailMax Chain',
        company: 'RetailMax Corporation',
        email: ['business@retailmax.com', 'it@retailmax.com'],
        phone: ['+1-555-0345', '+1-555-0346'],
        address: '789 Commerce Blvd, New York, NY 10001',
        website: 'https://retailmax.com',
        notes: 'Large retail chain looking to modernize their systems. Multiple locations.',
        status: ClientStatus.ACTIVE,
        userId: users[0].id,
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
        notes: 'Fast-moving startup, needs quick turnaround. Very responsive to communication.',
        status: ClientStatus.ACTIVE,
        userId: users[1].id,
      },
    }),
    prisma.client.create({
      data: {
        name: 'Legacy Systems Inc',
        company: 'Legacy Systems Corporation',
        email: ['contact@legacysystems.com'],
        phone: ['+1-555-0567'],
        address: '654 Old Tech Road, Boston, MA 02101',
        website: 'https://legacysystems.com',
        notes: 'Former client, project completed successfully. Potential for future work.',
        status: ClientStatus.INACTIVE,
        userId: users[0].id,
      },
    }),
  ]);

  console.log('🏢 Created clients');

  // Create Projects
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: 'E-commerce Platform Redesign',
        description: 'Complete redesign and development of the client\'s e-commerce platform with modern UI/UX, improved performance, and mobile responsiveness.',
        clientId: clients[0].id,
        userId: users[0].id,
        deliverables: [
          'UI/UX Design Mockups',
          'Frontend Development',
          'Backend API Development',
          'Payment Integration',
          'Testing & QA',
          'Deployment & Launch'
        ],
        status: ProjectStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        startDate: new Date('2024-08-01'),
        endDate: new Date('2024-12-15'),
        budget: 85000.00,
        actualCost: 52000.00,
        tags: ['web-development', 'e-commerce', 'react', 'nodejs'],
      },
    }),
    prisma.project.create({
      data: {
        name: 'Environmental Data Dashboard',
        description: 'Development of an interactive dashboard to visualize environmental data and track sustainability metrics for the foundation.',
        clientId: clients[1].id,
        userId: users[1].id,
        deliverables: [
          'Data Analysis & Requirements',
          'Dashboard Design',
          'Data Visualization Components',
          'Real-time Data Integration',
          'User Training Materials'
        ],
        status: ProjectStatus.IN_PROGRESS,
        priority: Priority.MEDIUM,
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-01-31'),
        budget: 45000.00,
        actualCost: 15000.00,
        tags: ['dashboard', 'data-visualization', 'environmental', 'react'],
      },
    }),
    prisma.project.create({
      data: {
        name: 'Inventory Management System',
        description: 'Custom inventory management system to track products across multiple retail locations with real-time synchronization.',
        clientId: clients[2].id,
        userId: users[0].id,
        deliverables: [
          'System Architecture Design',
          'Database Schema Design',
          'Backend Development',
          'Admin Dashboard',
          'Mobile App Development',
          'Integration with POS Systems'
        ],
        status: ProjectStatus.PENDING,
        priority: Priority.HIGH,
        startDate: new Date('2024-10-01'),
        endDate: new Date('2025-03-31'),
        budget: 120000.00,
        tags: ['inventory', 'retail', 'mobile-app', 'integration'],
      },
    }),
    prisma.project.create({
      data: {
        name: 'MVP Development',
        description: 'Rapid development of minimum viable product for the startup\'s core platform featuring user authentication, basic CRUD operations, and payment processing.',
        clientId: clients[3].id,
        userId: users[1].id,
        deliverables: [
          'Technical Specification',
          'MVP Frontend',
          'MVP Backend',
          'User Authentication',
          'Payment Integration',
          'Basic Analytics'
        ],
        status: ProjectStatus.COMPLETED,
        priority: Priority.URGENT,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-08-31'),
        budget: 35000.00,
        actualCost: 32000.00,
        tags: ['mvp', 'startup', 'authentication', 'payments'],
      },
    }),
    prisma.project.create({
      data: {
        name: 'System Migration & Modernization',
        description: 'Migration of legacy systems to modern cloud infrastructure with improved security and performance.',
        clientId: clients[4].id,
        userId: users[0].id,
        deliverables: [
          'Legacy System Assessment',
          'Migration Strategy',
          'Cloud Infrastructure Setup',
          'Data Migration',
          'Security Implementation',
          'Performance Optimization'
        ],
        status: ProjectStatus.COMPLETED,
        priority: Priority.MEDIUM,
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-07-31'),
        budget: 95000.00,
        actualCost: 89000.00,
        tags: ['migration', 'cloud', 'legacy-systems', 'security'],
      },
    }),
    prisma.project.create({
      data: {
        name: 'Mobile App Development',
        description: 'Native mobile application development for iOS and Android with cross-platform synchronization.',
        clientId: clients[0].id,
        userId: users[2].id,
        deliverables: [
          'Mobile App Design',
          'iOS Development',
          'Android Development',
          'API Integration',
          'App Store Submission',
          'User Documentation'
        ],
        status: ProjectStatus.ON_HOLD,
        priority: Priority.LOW,
        startDate: new Date('2024-11-01'),
        endDate: new Date('2025-04-30'),
        budget: 75000.00,
        tags: ['mobile', 'ios', 'android', 'cross-platform'],
      },
    }),
  ]);

  console.log('📋 Created projects'); 
 // Create Tasks
  const tasks = await Promise.all([
    // Tasks for E-commerce Platform Redesign
    prisma.task.create({
      data: {
        title: 'Create wireframes for product catalog',
        description: 'Design wireframes for the new product catalog layout with improved navigation and filtering options.',
        projectId: projects[0].id,
        userId: users[3].id,
        status: ProjectStatus.COMPLETED,
        priority: Priority.HIGH,
        dueDate: new Date('2024-08-15'),
        completed: true,
        estimatedHours: 16,
        actualHours: 14,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Implement shopping cart functionality',
        description: 'Develop the shopping cart component with add/remove items, quantity updates, and price calculations.',
        projectId: projects[0].id,
        userId: users[2].id,
        status: ProjectStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        dueDate: new Date('2024-09-30'),
        completed: false,
        estimatedHours: 32,
        actualHours: 24,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Set up payment gateway integration',
        description: 'Integrate Stripe payment processing with support for multiple payment methods and currencies.',
        projectId: projects[0].id,
        userId: users[2].id,
        status: ProjectStatus.PENDING,
        priority: Priority.MEDIUM,
        dueDate: new Date('2024-10-15'),
        completed: false,
        estimatedHours: 24,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Optimize database queries',
        description: 'Review and optimize database queries for better performance, especially for product search and filtering.',
        projectId: projects[0].id,
        userId: users[2].id,
        status: ProjectStatus.PENDING,
        priority: Priority.MEDIUM,
        dueDate: new Date('2024-11-01'),
        completed: false,
        estimatedHours: 20,
      },
    }),

    // Tasks for Environmental Data Dashboard
    prisma.task.create({
      data: {
        title: 'Analyze environmental data requirements',
        description: 'Meet with stakeholders to understand data sources and visualization requirements for the dashboard.',
        projectId: projects[1].id,
        userId: users[1].id,
        status: ProjectStatus.COMPLETED,
        priority: Priority.HIGH,
        dueDate: new Date('2024-09-15'),
        completed: true,
        estimatedHours: 12,
        actualHours: 10,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Create data visualization components',
        description: 'Develop reusable chart components for displaying air quality, water quality, and carbon footprint data.',
        projectId: projects[1].id,
        userId: users[3].id,
        status: ProjectStatus.IN_PROGRESS,
        priority: Priority.MEDIUM,
        dueDate: new Date('2024-10-30'),
        completed: false,
        estimatedHours: 40,
        actualHours: 28,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Implement real-time data feeds',
        description: 'Set up real-time data integration from environmental monitoring stations and APIs.',
        projectId: projects[1].id,
        userId: users[2].id,
        status: ProjectStatus.PENDING,
        priority: Priority.HIGH,
        dueDate: new Date('2024-11-15'),
        completed: false,
        estimatedHours: 36,
      },
    }),

    // Tasks for Inventory Management System
    prisma.task.create({
      data: {
        title: 'Design database schema for inventory',
        description: 'Create comprehensive database schema for products, locations, stock levels, and transaction history.',
        projectId: projects[2].id,
        userId: users[2].id,
        status: ProjectStatus.PENDING,
        priority: Priority.URGENT,
        dueDate: new Date('2024-10-15'),
        completed: false,
        estimatedHours: 24,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Create product management interface',
        description: 'Develop admin interface for adding, editing, and categorizing products with bulk operations support.',
        projectId: projects[2].id,
        userId: users[3].id,
        status: ProjectStatus.PENDING,
        priority: Priority.HIGH,
        dueDate: new Date('2024-11-30'),
        completed: false,
        estimatedHours: 48,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Implement barcode scanning',
        description: 'Add barcode scanning functionality for mobile app to quickly update inventory levels.',
        projectId: projects[2].id,
        userId: users[2].id,
        status: ProjectStatus.PENDING,
        priority: Priority.MEDIUM,
        dueDate: new Date('2024-12-15'),
        completed: false,
        estimatedHours: 32,
      },
    }),

    // Tasks for MVP Development (Completed Project)
    prisma.task.create({
      data: {
        title: 'Set up user authentication system',
        description: 'Implement secure user registration, login, and password reset functionality.',
        projectId: projects[3].id,
        userId: users[2].id,
        status: ProjectStatus.COMPLETED,
        priority: Priority.URGENT,
        dueDate: new Date('2024-06-15'),
        completed: true,
        estimatedHours: 20,
        actualHours: 18,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Develop core CRUD operations',
        description: 'Build basic create, read, update, delete operations for the main application entities.',
        projectId: projects[3].id,
        userId: users[2].id,
        status: ProjectStatus.COMPLETED,
        priority: Priority.HIGH,
        dueDate: new Date('2024-07-15'),
        completed: true,
        estimatedHours: 32,
        actualHours: 30,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Integrate payment processing',
        description: 'Add Stripe integration for handling subscription payments and one-time purchases.',
        projectId: projects[3].id,
        userId: users[2].id,
        status: ProjectStatus.COMPLETED,
        priority: Priority.HIGH,
        dueDate: new Date('2024-08-01'),
        completed: true,
        estimatedHours: 24,
        actualHours: 26,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Deploy to production environment',
        description: 'Set up production deployment pipeline and deploy MVP to cloud hosting platform.',
        projectId: projects[3].id,
        userId: users[0].id,
        status: ProjectStatus.COMPLETED,
        priority: Priority.URGENT,
        dueDate: new Date('2024-08-30'),
        completed: true,
        estimatedHours: 16,
        actualHours: 20,
      },
    }),

    // Tasks for System Migration (Completed Project)
    prisma.task.create({
      data: {
        title: 'Assess legacy system architecture',
        description: 'Comprehensive analysis of existing legacy systems, dependencies, and migration complexity.',
        projectId: projects[4].id,
        userId: users[0].id,
        status: ProjectStatus.COMPLETED,
        priority: Priority.HIGH,
        dueDate: new Date('2024-03-15'),
        completed: true,
        estimatedHours: 40,
        actualHours: 42,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Migrate user data to new system',
        description: 'Safely migrate all user accounts, preferences, and historical data to the new cloud infrastructure.',
        projectId: projects[4].id,
        userId: users[2].id,
        status: ProjectStatus.COMPLETED,
        priority: Priority.URGENT,
        dueDate: new Date('2024-05-31'),
        completed: true,
        estimatedHours: 60,
        actualHours: 58,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Implement security hardening',
        description: 'Apply security best practices, SSL certificates, and compliance measures for the new system.',
        projectId: projects[4].id,
        userId: users[0].id,
        status: ProjectStatus.COMPLETED,
        priority: Priority.URGENT,
        dueDate: new Date('2024-07-15'),
        completed: true,
        estimatedHours: 32,
        actualHours: 35,
      },
    }),

    // Tasks for Mobile App Development (On Hold Project)
    prisma.task.create({
      data: {
        title: 'Research mobile development frameworks',
        description: 'Evaluate React Native vs native development approaches for the client\'s requirements.',
        projectId: projects[5].id,
        userId: users[2].id,
        status: ProjectStatus.COMPLETED,
        priority: Priority.MEDIUM,
        dueDate: new Date('2024-11-15'),
        completed: true,
        estimatedHours: 16,
        actualHours: 12,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Design mobile app user interface',
        description: 'Create mobile-first UI designs with consistent branding and intuitive navigation patterns.',
        projectId: projects[5].id,
        userId: users[3].id,
        status: ProjectStatus.PENDING,
        priority: Priority.LOW,
        dueDate: new Date('2025-01-15'),
        completed: false,
        estimatedHours: 32,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Set up development environment',
        description: 'Configure development tools, testing frameworks, and CI/CD pipeline for mobile app development.',
        projectId: projects[5].id,
        userId: users[2].id,
        status: ProjectStatus.PENDING,
        priority: Priority.LOW,
        dueDate: new Date('2025-02-01'),
        completed: false,
        estimatedHours: 20,
      },
    }),
  ]);

  console.log('✅ Created tasks');

  // Display summary
  const userCount = await prisma.user.count();
  const clientCount = await prisma.client.count();
  const projectCount = await prisma.project.count();
  const taskCount = await prisma.task.count();

  console.log('\n🎉 Database seeding completed successfully!');
  console.log(`📊 Summary:`);
  console.log(`   Users: ${userCount}`);
  console.log(`   Clients: ${clientCount}`);
  console.log(`   Projects: ${projectCount}`);
  console.log(`   Tasks: ${taskCount}`);
  console.log('\n✨ Your database is now populated with realistic sample data!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
import { PrismaClient, ClientStatus, ProjectStatus, Priority, PaymentType, PaymentMethod, PaymentStatus, InvoiceStatus } from '@/app/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.payment.deleteMany();
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
    prisma.user.create({
      data: {
        email: 'alex.rodriguez@example.com',
        clerkId: 'clerk_user_5',
        name: 'Alex Rodriguez',
        role: 'DEVELOPER',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
      },
    }),
    prisma.user.create({
      data: {
        email: 'priya.patel@example.com',
        clerkId: 'clerk_user_6',
        name: 'Priya Patel',
        role: 'QA_ENGINEER',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
      },
    }),
    prisma.user.create({
      data: {
        email: 'david.kim@example.com',
        clerkId: 'clerk_user_7',
        name: 'David Kim',
        role: 'BUSINESS_ANALYST',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
      },
    }),
    prisma.user.create({
      data: {
        email: 'lisa.thompson@example.com',
        clerkId: 'clerk_user_8',
        name: 'Lisa Thompson',
        role: 'UI_UX_DESIGNER',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa',
      },
    }),
    prisma.user.create({
      data: {
        email: 'carlos.mendez@example.com',
        clerkId: 'clerk_user_9',
        name: 'Carlos Mendez',
        role: 'DEVOPS_ENGINEER',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos',
      },
    }),
    prisma.user.create({
      data: {
        email: 'nina.johansson@example.com',
        clerkId: 'clerk_user_10',
        name: 'Nina Johansson',
        role: 'PRODUCT_MANAGER',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nina',
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
    prisma.client.create({
      data: {
        name: 'HealthTech Innovations',
        company: 'HealthTech Medical Solutions',
        email: ['contact@healthtech.com', 'dev@healthtech.com'],
        phone: ['+1-555-0678', '+1-555-0679'],
        address: '890 Medical Center Dr, Houston, TX 77030',
        website: 'https://healthtech-innovations.com',
        notes: 'Healthcare technology company. Requires HIPAA compliance and high security standards.',
        status: ClientStatus.ACTIVE,
        userId: users[6].id,
      },
    }),
    prisma.client.create({
      data: {
        name: 'EduLearn Platform',
        company: 'EduLearn Technologies',
        email: ['info@edulearn.com'],
        phone: ['+1-555-0789'],
        address: '234 Education Blvd, Chicago, IL 60601',
        website: 'https://edulearn.com',
        notes: 'Online education platform serving K-12 schools. Focus on accessibility and mobile-first design.',
        status: ClientStatus.ACTIVE,
        userId: users[9].id,
      },
    }),
    prisma.client.create({
      data: {
        name: 'FinanceFlow Solutions',
        company: 'FinanceFlow Corp',
        email: ['business@financeflow.com', 'tech@financeflow.com'],
        phone: ['+1-555-0890', '+1-555-0891'],
        address: '567 Wall Street, New York, NY 10005',
        website: 'https://financeflow.com',
        notes: 'Financial services company requiring high-performance trading systems and real-time data processing.',
        status: ClientStatus.ACTIVE,
        userId: users[0].id,
      },
    }),
    prisma.client.create({
      data: {
        name: 'Creative Studios Collective',
        company: 'Creative Studios LLC',
        email: ['hello@creativestudios.com'],
        phone: ['+1-555-0901'],
        address: '123 Art District, Los Angeles, CA 90028',
        website: 'https://creativestudios.com',
        notes: 'Creative agency specializing in digital art and interactive experiences. Values innovative design.',
        status: ClientStatus.ACTIVE,
        userId: users[7].id,
      },
    }),
    prisma.client.create({
      data: {
        name: 'Global Logistics Hub',
        company: 'Global Logistics International',
        email: ['operations@globallogistics.com', 'it@globallogistics.com'],
        phone: ['+1-555-1012', '+1-555-1013'],
        address: '789 Shipping Lane, Miami, FL 33101',
        website: 'https://globallogistics.com',
        notes: 'International shipping and logistics company. Needs multi-language support and global scalability.',
        status: ClientStatus.ACTIVE,
        userId: users[8].id,
      },
    }),
    prisma.client.create({
      data: {
        name: 'Sunset Consulting',
        company: 'Sunset Business Consulting',
        email: ['contact@sunsetconsulting.com'],
        phone: ['+1-555-1123'],
        address: '456 Sunset Blvd, San Diego, CA 92101',
        website: 'https://sunsetconsulting.com',
        notes: 'Former client, project was cancelled due to budget constraints. Maintain good relationship.',
        status: ClientStatus.ARCHIVED,
        userId: users[1].id,
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
    prisma.project.create({
      data: {
        name: 'HIPAA-Compliant Patient Portal',
        description: 'Secure patient portal with appointment scheduling, medical records access, and telemedicine integration.',
        clientId: clients[5].id,
        userId: users[6].id,
        deliverables: [
          'Security Assessment',
          'HIPAA Compliance Documentation',
          'Patient Authentication System',
          'Medical Records Interface',
          'Telemedicine Integration',
          'Mobile Responsive Design',
          'Security Audit & Testing'
        ],
        status: ProjectStatus.IN_PROGRESS,
        priority: Priority.URGENT,
        startDate: new Date('2024-09-15'),
        endDate: new Date('2025-02-28'),
        budget: 150000.00,
        tags: ['healthcare', 'hipaa', 'security', 'telemedicine', 'portal'],
      },
    }),
    prisma.project.create({
      data: {
        name: 'K-12 Learning Management System',
        description: 'Comprehensive LMS for K-12 education with student progress tracking, parent portals, and accessibility features.',
        clientId: clients[6].id,
        userId: users[9].id,
        deliverables: [
          'Educational Requirements Analysis',
          'Accessibility Compliance (WCAG 2.1)',
          'Student Dashboard',
          'Teacher Portal',
          'Parent Communication System',
          'Progress Analytics',
          'Mobile App Development'
        ],
        status: ProjectStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        startDate: new Date('2024-08-01'),
        endDate: new Date('2025-05-31'),
        budget: 200000.00,
        tags: ['education', 'lms', 'accessibility', 'k12', 'analytics'],
      },
    }),
    prisma.project.create({
      data: {
        name: 'High-Frequency Trading Platform',
        description: 'Ultra-low latency trading system with real-time market data processing and risk management.',
        clientId: clients[7].id,
        userId: users[0].id,
        deliverables: [
          'System Architecture Design',
          'Low-Latency Infrastructure',
          'Real-time Data Processing',
          'Risk Management Engine',
          'Trading Algorithm Integration',
          'Performance Monitoring',
          'Regulatory Compliance'
        ],
        status: ProjectStatus.PENDING,
        priority: Priority.URGENT,
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-08-31'),
        budget: 500000.00,
        tags: ['fintech', 'trading', 'real-time', 'high-performance', 'algorithms'],
      },
    }),
    prisma.project.create({
      data: {
        name: 'Interactive Art Installation Platform',
        description: 'Digital platform for creating and managing interactive art installations with AR/VR capabilities.',
        clientId: clients[8].id,
        userId: users[7].id,
        deliverables: [
          'Creative Concept Development',
          'AR/VR Integration',
          'Interactive UI Design',
          'Content Management System',
          'Installation Hardware Setup',
          'Artist Collaboration Tools',
          'Exhibition Management'
        ],
        status: ProjectStatus.IN_PROGRESS,
        priority: Priority.MEDIUM,
        startDate: new Date('2024-10-01'),
        endDate: new Date('2025-03-15'),
        budget: 95000.00,
        tags: ['art', 'interactive', 'ar-vr', 'creative', 'installation'],
      },
    }),
    prisma.project.create({
      data: {
        name: 'Global Supply Chain Tracker',
        description: 'Multi-language supply chain management system with real-time tracking and predictive analytics.',
        clientId: clients[9].id,
        userId: users[8].id,
        deliverables: [
          'Multi-language Support Implementation',
          'Real-time Tracking System',
          'Predictive Analytics Engine',
          'Supplier Management Portal',
          'Customer Notification System',
          'Mobile Tracking App',
          'Integration with Shipping APIs'
        ],
        status: ProjectStatus.PENDING,
        priority: Priority.HIGH,
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-09-30'),
        budget: 180000.00,
        tags: ['logistics', 'tracking', 'analytics', 'multi-language', 'global'],
      },
    }),
    prisma.project.create({
      data: {
        name: 'Business Process Automation',
        description: 'Automated workflow system for business consulting processes and client management.',
        clientId: clients[10].id,
        userId: users[1].id,
        deliverables: [
          'Process Analysis',
          'Workflow Automation Design',
          'Client Onboarding System',
          'Document Management',
          'Reporting Dashboard',
          'Integration Setup'
        ],
        status: ProjectStatus.CANCELLED,
        priority: Priority.MEDIUM,
        startDate: new Date('2024-07-01'),
        endDate: new Date('2024-12-31'),
        budget: 65000.00,
        tags: ['automation', 'workflow', 'consulting', 'cancelled'],
      },
    }),
  ]);

  console.log('📋 Created projects');

  // Create Payments with diverse scenarios
  const payments = await Promise.all([
    // Payments for E-commerce Platform Redesign (Project 0)
    prisma.payment.create({
      data: {
        amount: 25500.00,
        date: new Date('2024-08-01'),
        description: 'Project initiation payment - 30% advance',
        type: PaymentType.ADVANCE,
        method: PaymentMethod.BANK_TRANSFER,
        status: PaymentStatus.COMPLETED,
        milestoneTitle: 'Project Kickoff',
        milestoneOrder: 1,
        taxAmount: 2295.00,
        netAmount: 23205.00,
        transactionId: 'TXN_EC_001',
        invoiceNumber: 'INV-2024-001',
        projectId: projects[0].id,
        clientId: clients[0].id,
      },
    }),
    prisma.payment.create({
      data: {
        amount: 25500.00,
        date: new Date('2024-09-15'),
        description: 'UI/UX Design completion milestone',
        type: PaymentType.MILESTONE,
        method: PaymentMethod.STRIPE,
        status: PaymentStatus.COMPLETED,
        milestoneTitle: 'Design Phase Complete',
        milestoneOrder: 2,
        taxAmount: 2295.00,
        netAmount: 23205.00,
        transactionId: 'TXN_EC_002',
        invoiceNumber: 'INV-2024-002',
        projectId: projects[0].id,
        clientId: clients[0].id,
      },
    }),
    prisma.payment.create({
      data: {
        amount: 34000.00,
        date: new Date('2024-12-15'),
        dueDate: new Date('2024-12-15'),
        description: 'Final payment upon project completion',
        type: PaymentType.FINAL,
        method: PaymentMethod.BANK_TRANSFER,
        status: PaymentStatus.PENDING,
        milestoneTitle: 'Project Completion',
        milestoneOrder: 3,
        taxAmount: 3060.00,
        netAmount: 30940.00,
        invoiceNumber: 'INV-2024-003',
        projectId: projects[0].id,
        clientId: clients[0].id,
      },
    }),

    // Payments for Environmental Data Dashboard (Project 1)
    prisma.payment.create({
      data: {
        amount: 13500.00,
        date: new Date('2024-09-01'),
        description: 'Initial payment for environmental dashboard',
        type: PaymentType.ADVANCE,
        method: PaymentMethod.PAYPAL,
        status: PaymentStatus.COMPLETED,
        milestoneTitle: 'Project Start',
        milestoneOrder: 1,
        taxAmount: 1215.00,
        netAmount: 12285.00,
        transactionId: 'PP_ENV_001',
        invoiceNumber: 'INV-2024-004',
        projectId: projects[1].id,
        clientId: clients[1].id,
      },
    }),
    prisma.payment.create({
      data: {
        amount: 15750.00,
        date: new Date('2024-11-01'),
        description: 'Data visualization components milestone',
        type: PaymentType.MILESTONE,
        method: PaymentMethod.PAYPAL,
        status: PaymentStatus.COMPLETED,
        milestoneTitle: 'Visualization Complete',
        milestoneOrder: 2,
        taxAmount: 1417.50,
        netAmount: 14332.50,
        transactionId: 'PP_ENV_002',
        invoiceNumber: 'INV-2024-005',
        projectId: projects[1].id,
        clientId: clients[1].id,
      },
    }),

    // Payments for MVP Development (Completed Project 3)
    prisma.payment.create({
      data: {
        amount: 35000.00,
        date: new Date('2024-06-01'),
        description: 'Full payment for MVP development',
        type: PaymentType.FULL_PAYMENT,
        method: PaymentMethod.CREDIT_CARD,
        status: PaymentStatus.COMPLETED,
        taxAmount: 3150.00,
        netAmount: 31850.00,
        transactionId: 'CC_MVP_001',
        invoiceNumber: 'INV-2024-006',
        projectId: projects[3].id,
        clientId: clients[3].id,
      },
    }),

    // Payments for HIPAA-Compliant Patient Portal (Project 6)
    prisma.payment.create({
      data: {
        amount: 45000.00,
        date: new Date('2024-09-15'),
        description: 'Security assessment and compliance documentation',
        type: PaymentType.ADVANCE,
        method: PaymentMethod.BANK_TRANSFER,
        status: PaymentStatus.COMPLETED,
        milestoneTitle: 'Security Phase',
        milestoneOrder: 1,
        taxAmount: 4050.00,
        netAmount: 40950.00,
        transactionId: 'BT_HEALTH_001',
        invoiceNumber: 'INV-2024-007',
        projectId: projects[6].id,
        clientId: clients[5].id,
      },
    }),
    prisma.payment.create({
      data: {
        amount: 52500.00,
        date: new Date('2024-12-01'),
        dueDate: new Date('2024-12-01'),
        description: 'Patient portal development milestone',
        type: PaymentType.MILESTONE,
        method: PaymentMethod.BANK_TRANSFER,
        status: PaymentStatus.PENDING,
        milestoneTitle: 'Portal Development',
        milestoneOrder: 2,
        taxAmount: 4725.00,
        netAmount: 47775.00,
        invoiceNumber: 'INV-2024-008',
        projectId: projects[6].id,
        clientId: clients[5].id,
      },
    }),

    // Payments for K-12 Learning Management System (Project 7)
    prisma.payment.create({
      data: {
        amount: 60000.00,
        date: new Date('2024-08-01'),
        description: 'Educational platform development - Phase 1',
        type: PaymentType.ADVANCE,
        method: PaymentMethod.CHEQUE,
        status: PaymentStatus.COMPLETED,
        milestoneTitle: 'Requirements & Design',
        milestoneOrder: 1,
        taxAmount: 5400.00,
        netAmount: 54600.00,
        transactionId: 'CHQ_EDU_001',
        invoiceNumber: 'INV-2024-009',
        projectId: projects[7].id,
        clientId: clients[6].id,
      },
    }),
    prisma.payment.create({
      data: {
        amount: 70000.00,
        date: new Date('2024-11-15'),
        description: 'Core platform development milestone',
        type: PaymentType.MILESTONE,
        method: PaymentMethod.BANK_TRANSFER,
        status: PaymentStatus.COMPLETED,
        milestoneTitle: 'Core Development',
        milestoneOrder: 2,
        taxAmount: 6300.00,
        netAmount: 63700.00,
        transactionId: 'BT_EDU_002',
        invoiceNumber: 'INV-2024-010',
        projectId: projects[7].id,
        clientId: clients[6].id,
      },
    }),

    // Payments for High-Frequency Trading Platform (Project 8)
    prisma.payment.create({
      data: {
        amount: 150000.00,
        date: new Date('2025-01-15'),
        dueDate: new Date('2025-01-15'),
        description: 'Trading platform development - Initial payment',
        type: PaymentType.ADVANCE,
        method: PaymentMethod.BANK_TRANSFER,
        status: PaymentStatus.PENDING,
        milestoneTitle: 'Architecture & Setup',
        milestoneOrder: 1,
        taxAmount: 13500.00,
        netAmount: 136500.00,
        invoiceNumber: 'INV-2025-001',
        projectId: projects[8].id,
        clientId: clients[7].id,
      },
    }),

    // Payments for Interactive Art Installation (Project 9)
    prisma.payment.create({
      data: {
        amount: 28500.00,
        date: new Date('2024-10-01'),
        description: 'Creative development and AR/VR setup',
        type: PaymentType.ADVANCE,
        method: PaymentMethod.CRYPTO,
        status: PaymentStatus.COMPLETED,
        milestoneTitle: 'Creative Phase',
        milestoneOrder: 1,
        taxAmount: 2565.00,
        netAmount: 25935.00,
        transactionId: 'CRYPTO_ART_001',
        invoiceNumber: 'INV-2024-011',
        projectId: projects[9].id,
        clientId: clients[8].id,
      },
    }),
    prisma.payment.create({
      data: {
        amount: 33250.00,
        date: new Date('2024-12-15'),
        dueDate: new Date('2024-12-15'),
        description: 'Installation and testing phase',
        type: PaymentType.MILESTONE,
        method: PaymentMethod.CRYPTO,
        status: PaymentStatus.PENDING,
        milestoneTitle: 'Installation Phase',
        milestoneOrder: 2,
        taxAmount: 2992.50,
        netAmount: 30257.50,
        invoiceNumber: 'INV-2024-012',
        projectId: projects[9].id,
        clientId: clients[8].id,
      },
    }),

    // Payments for cancelled project (Project 11)
    prisma.payment.create({
      data: {
        amount: 15000.00,
        date: new Date('2024-07-01'),
        description: 'Initial consultation and analysis',
        type: PaymentType.ADVANCE,
        method: PaymentMethod.BANK_TRANSFER,
        status: PaymentStatus.COMPLETED,
        milestoneTitle: 'Initial Analysis',
        milestoneOrder: 1,
        taxAmount: 1350.00,
        netAmount: 13650.00,
        transactionId: 'BT_CONSULT_001',
        invoiceNumber: 'INV-2024-013',
        projectId: projects[11].id,
        clientId: clients[10].id,
      },
    }),

    // December 2024 payments for monthly revenue
    prisma.payment.create({
      data: {
        amount: 42000.00,
        date: new Date('2024-12-05'),
        description: 'Monthly milestone payment',
        type: PaymentType.MILESTONE,
        method: PaymentMethod.BANK_TRANSFER,
        status: PaymentStatus.COMPLETED,
        taxAmount: 3780.00,
        netAmount: 38220.00,
        transactionId: 'BT_DEC_001',
        invoiceNumber: 'INV-2024-016',
        projectId: projects[0].id,
        clientId: clients[0].id,
      },
    }),
    prisma.payment.create({
      data: {
        amount: 28500.00,
        date: new Date('2024-12-08'),
        description: 'Dashboard development completion',
        type: PaymentType.MILESTONE,
        method: PaymentMethod.STRIPE,
        status: PaymentStatus.COMPLETED,
        taxAmount: 2565.00,
        netAmount: 25935.00,
        transactionId: 'STR_DEC_002',
        invoiceNumber: 'INV-2024-017',
        projectId: projects[1].id,
        clientId: clients[1].id,
      },
    }),
    prisma.payment.create({
      data: {
        amount: 65000.00,
        date: new Date('2024-12-12'),
        description: 'Healthcare portal milestone',
        type: PaymentType.MILESTONE,
        method: PaymentMethod.BANK_TRANSFER,
        status: PaymentStatus.COMPLETED,
        taxAmount: 5850.00,
        netAmount: 59150.00,
        transactionId: 'BT_DEC_003',
        invoiceNumber: 'INV-2024-018',
        projectId: projects[6].id,
        clientId: clients[5].id,
      },
    }),
    prisma.payment.create({
      data: {
        amount: 35000.00,
        date: new Date('2024-12-15'),
        description: 'Art installation progress payment',
        type: PaymentType.MILESTONE,
        method: PaymentMethod.CRYPTO,
        status: PaymentStatus.COMPLETED,
        taxAmount: 3150.00,
        netAmount: 31850.00,
        transactionId: 'CRYPTO_DEC_004',
        invoiceNumber: 'INV-2024-019',
        projectId: projects[9].id,
        clientId: clients[8].id,
      },
    }),
    prisma.payment.create({
      data: {
        amount: 18750.00,
        date: new Date('2024-12-18'),
        description: 'Additional feature development',
        type: PaymentType.PARTIAL,
        method: PaymentMethod.UPI,
        status: PaymentStatus.COMPLETED,
        taxAmount: 1687.50,
        netAmount: 17062.50,
        transactionId: 'UPI_DEC_005',
        invoiceNumber: 'INV-2024-020',
        projectId: projects[7].id,
        clientId: clients[6].id,
      },
    }),

    // Diverse payment methods and scenarios
    prisma.payment.create({
      data: {
        amount: 5000.00,
        date: new Date('2024-08-15'),
        description: 'Partial refund for scope reduction',
        type: PaymentType.REFUND,
        method: PaymentMethod.BANK_TRANSFER,
        status: PaymentStatus.COMPLETED,
        taxAmount: 450.00,
        netAmount: 4550.00,
        transactionId: 'REFUND_001',
        invoiceNumber: 'REF-2024-001',
        projectId: projects[1].id,
        clientId: clients[1].id,
      },
    }),
    prisma.payment.create({
      data: {
        amount: 12000.00,
        date: new Date('2024-10-15'),
        dueDate: new Date('2024-10-20'),
        description: 'Additional features development',
        type: PaymentType.PARTIAL,
        method: PaymentMethod.UPI,
        status: PaymentStatus.FAILED,
        taxAmount: 1080.00,
        netAmount: 10920.00,
        invoiceNumber: 'INV-2024-014',
        projectId: projects[0].id,
        clientId: clients[0].id,
      },
    }),
    prisma.payment.create({
      data: {
        amount: 8500.00,
        date: new Date('2024-09-30'),
        description: 'Emergency bug fixes and support',
        type: PaymentType.PARTIAL,
        method: PaymentMethod.RAZORPAY,
        status: PaymentStatus.PARTIALLY_PAID,
        taxAmount: 765.00,
        netAmount: 7735.00,
        transactionId: 'RZP_SUPPORT_001',
        invoiceNumber: 'INV-2024-015',
        projectId: projects[3].id,
        clientId: clients[3].id,
      },
    }),
  ]);

  console.log('💳 Created payments');

  // Create Invoices with Items
  const invoices = await Promise.all([
    // Invoice 1 - E-commerce Platform Design Phase
    prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2024-001',
        title: 'E-commerce Platform - Design Phase',
        description: 'UI/UX Design and wireframes for e-commerce platform redesign',
        issueDate: new Date('2024-08-01'),
        dueDate: new Date('2024-08-31'),
        status: InvoiceStatus.PAID,
        subtotal: 23205.00,
        taxRate: 0.09,
        taxAmount: 2088.45,
        totalAmount: 25293.45,
        clientId: clients[0].id,
        projectId: projects[0].id,
        notes: 'Payment due within 30 days of invoice date.',
        terms: 'Net 30 payment terms. Late payments subject to 1.5% monthly service charge.',
        items: {
          create: [
            {
              description: 'UI/UX Design Consultation',
              quantity: 40,
              unitPrice: 150.00,
              totalPrice: 6000.00,
            },
            {
              description: 'Wireframe Development',
              quantity: 32,
              unitPrice: 125.00,
              totalPrice: 4000.00,
            },
            {
              description: 'Design System Creation',
              quantity: 24,
              unitPrice: 175.00,
              totalPrice: 4200.00,
            },
            {
              description: 'Prototype Development',
              quantity: 36,
              unitPrice: 160.00,
              totalPrice: 5760.00,
            },
            {
              description: 'User Testing & Feedback',
              quantity: 20,
              unitPrice: 140.00,
              totalPrice: 2800.00,
            },
            {
              description: 'Design Documentation',
              quantity: 3,
              unitPrice: 215.00,
              totalPrice: 645.00,
            },
          ],
        },
      },
    }),

    // Invoice 2 - Environmental Dashboard Development
    prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2024-002',
        title: 'Environmental Data Dashboard - Phase 1',
        description: 'Data analysis and dashboard component development',
        issueDate: new Date('2024-09-01'),
        dueDate: new Date('2024-10-01'),
        status: InvoiceStatus.PAID,
        subtotal: 12285.00,
        taxRate: 0.08,
        taxAmount: 982.80,
        totalAmount: 13267.80,
        clientId: clients[1].id,
        projectId: projects[1].id,
        notes: 'Non-profit discount applied. Thank you for your environmental mission.',
        terms: 'Net 30 payment terms.',
        items: {
          create: [
            {
              description: 'Data Analysis & Requirements Gathering',
              quantity: 24,
              unitPrice: 120.00,
              totalPrice: 2880.00,
            },
            {
              description: 'Dashboard Architecture Design',
              quantity: 16,
              unitPrice: 145.00,
              totalPrice: 2320.00,
            },
            {
              description: 'Chart Component Development',
              quantity: 32,
              unitPrice: 135.00,
              totalPrice: 4320.00,
            },
            {
              description: 'Data Integration Setup',
              quantity: 20,
              unitPrice: 155.00,
              totalPrice: 3100.00,
            },
          ],
        },
      },
    }),

    // Invoice 3 - Healthcare Portal Security Phase
    prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2024-003',
        title: 'HIPAA-Compliant Patient Portal - Security Implementation',
        description: 'Security assessment, compliance documentation, and authentication system',
        issueDate: new Date('2024-09-15'),
        dueDate: new Date('2024-10-15'),
        status: InvoiceStatus.PAID,
        subtotal: 40950.00,
        taxRate: 0.10,
        taxAmount: 4095.00,
        totalAmount: 45045.00,
        clientId: clients[5].id,
        projectId: projects[6].id,
        notes: 'HIPAA compliance certification included. All security standards met.',
        terms: 'Net 30 payment terms. Security audit report provided upon payment.',
        items: {
          create: [
            {
              description: 'HIPAA Compliance Assessment',
              quantity: 40,
              unitPrice: 200.00,
              totalPrice: 8000.00,
            },
            {
              description: 'Security Architecture Design',
              quantity: 32,
              unitPrice: 225.00,
              totalPrice: 7200.00,
            },
            {
              description: 'Authentication System Development',
              quantity: 48,
              unitPrice: 185.00,
              totalPrice: 8880.00,
            },
            {
              description: 'Encryption Implementation',
              quantity: 24,
              unitPrice: 210.00,
              totalPrice: 5040.00,
            },
            {
              description: 'Security Testing & Audit',
              quantity: 36,
              unitPrice: 175.00,
              totalPrice: 6300.00,
            },
            {
              description: 'Compliance Documentation',
              quantity: 30,
              unitPrice: 185.00,
              totalPrice: 5550.00,
            },
          ],
        },
      },
    }),

    // Invoice 4 - K-12 LMS Development (Current)
    prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2024-004',
        title: 'K-12 Learning Management System - Core Development',
        description: 'Student dashboard, teacher portal, and accessibility features',
        issueDate: new Date('2024-11-01'),
        dueDate: new Date('2024-12-01'),
        status: InvoiceStatus.SENT,
        subtotal: 63700.00,
        taxRate: 0.09,
        taxAmount: 5733.00,
        totalAmount: 69433.00,
        clientId: clients[6].id,
        projectId: projects[7].id,
        notes: 'Accessibility compliance (WCAG 2.1) included. Mobile-responsive design.',
        terms: 'Net 30 payment terms. Progress demos scheduled bi-weekly.',
        items: {
          create: [
            {
              description: 'Student Dashboard Development',
              quantity: 60,
              unitPrice: 165.00,
              totalPrice: 9900.00,
            },
            {
              description: 'Teacher Portal Creation',
              quantity: 72,
              unitPrice: 170.00,
              totalPrice: 12240.00,
            },
            {
              description: 'Parent Communication System',
              quantity: 48,
              unitPrice: 155.00,
              totalPrice: 7440.00,
            },
            {
              description: 'Progress Analytics Engine',
              quantity: 56,
              unitPrice: 180.00,
              totalPrice: 10080.00,
            },
            {
              description: 'Accessibility Compliance (WCAG 2.1)',
              quantity: 40,
              unitPrice: 190.00,
              totalPrice: 7600.00,
            },
            {
              description: 'Mobile App Development',
              quantity: 88,
              unitPrice: 185.00,
              totalPrice: 16280.00,
            },
          ],
        },
      },
    }),

    // Invoice 5 - Art Installation Platform (Pending)
    prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2024-005',
        title: 'Interactive Art Installation Platform - AR/VR Integration',
        description: 'Creative development, AR/VR capabilities, and content management system',
        issueDate: new Date('2024-12-01'),
        dueDate: new Date('2024-12-31'),
        status: InvoiceStatus.VIEWED,
        subtotal: 30257.50,
        taxRate: 0.08,
        taxAmount: 2420.60,
        totalAmount: 32678.10,
        clientId: clients[8].id,
        projectId: projects[9].id,
        notes: 'Cutting-edge AR/VR technology integration. Custom hardware setup included.',
        terms: 'Net 30 payment terms. Hardware procurement upon 50% advance payment.',
        items: {
          create: [
            {
              description: 'Creative Concept Development',
              quantity: 32,
              unitPrice: 175.00,
              totalPrice: 5600.00,
            },
            {
              description: 'AR/VR Integration Development',
              quantity: 48,
              unitPrice: 220.00,
              totalPrice: 10560.00,
            },
            {
              description: 'Interactive UI Design',
              quantity: 28,
              unitPrice: 165.00,
              totalPrice: 4620.00,
            },
            {
              description: 'Content Management System',
              quantity: 36,
              unitPrice: 155.00,
              totalPrice: 5580.00,
            },
            {
              description: 'Hardware Setup & Configuration',
              quantity: 24,
              unitPrice: 185.00,
              totalPrice: 4440.00,
            },
          ],
        },
      },
    }),

    // Invoice 6 - Trading Platform (Future)
    prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2025-001',
        title: 'High-Frequency Trading Platform - Architecture & Setup',
        description: 'System architecture design and low-latency infrastructure setup',
        issueDate: new Date('2025-01-15'),
        dueDate: new Date('2025-02-14'),
        status: InvoiceStatus.DRAFT,
        subtotal: 136500.00,
        taxRate: 0.10,
        taxAmount: 13650.00,
        totalAmount: 150150.00,
        clientId: clients[7].id,
        projectId: projects[8].id,
        notes: 'Ultra-low latency requirements. 24/7 monitoring and support included.',
        terms: 'Net 30 payment terms. Milestone-based payments with performance guarantees.',
        items: {
          create: [
            {
              description: 'System Architecture Design',
              quantity: 80,
              unitPrice: 300.00,
              totalPrice: 24000.00,
            },
            {
              description: 'Low-Latency Infrastructure Setup',
              quantity: 120,
              unitPrice: 275.00,
              totalPrice: 33000.00,
            },
            {
              description: 'Real-time Data Processing Engine',
              quantity: 96,
              unitPrice: 285.00,
              totalPrice: 27360.00,
            },
            {
              description: 'Risk Management System',
              quantity: 72,
              unitPrice: 265.00,
              totalPrice: 19080.00,
            },
            {
              description: 'Performance Monitoring Setup',
              quantity: 48,
              unitPrice: 245.00,
              totalPrice: 11760.00,
            },
            {
              description: 'Regulatory Compliance Framework',
              quantity: 84,
              unitPrice: 255.00,
              totalPrice: 21420.00,
            },
          ],
        },
      },
    }),

    // Invoice 7 - Overdue Invoice Example
    prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2024-006',
        title: 'Mobile App Development - Research & Planning',
        description: 'Framework evaluation and initial planning phase',
        issueDate: new Date('2024-10-01'),
        dueDate: new Date('2024-10-31'),
        status: InvoiceStatus.OVERDUE,
        subtotal: 8500.00,
        taxRate: 0.08,
        taxAmount: 680.00,
        totalAmount: 9180.00,
        clientId: clients[0].id,
        projectId: projects[5].id,
        notes: 'Project currently on hold. Payment required to resume development.',
        terms: 'Net 30 payment terms. Late payment fees may apply.',
        items: {
          create: [
            {
              description: 'Mobile Framework Research',
              quantity: 16,
              unitPrice: 150.00,
              totalPrice: 2400.00,
            },
            {
              description: 'Technical Planning & Documentation',
              quantity: 24,
              unitPrice: 135.00,
              totalPrice: 3240.00,
            },
            {
              description: 'UI/UX Planning for Mobile',
              quantity: 20,
              unitPrice: 145.00,
              totalPrice: 2900.00,
            },
          ],
        },
      },
    }),

    // Invoice 8 - Cancelled Project Invoice
    prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2024-007',
        title: 'Business Process Automation - Initial Analysis',
        description: 'Process analysis and workflow automation planning',
        issueDate: new Date('2024-07-01'),
        dueDate: new Date('2024-07-31'),
        status: InvoiceStatus.CANCELLED,
        subtotal: 13650.00,
        taxRate: 0.09,
        taxAmount: 1228.50,
        totalAmount: 14878.50,
        clientId: clients[10].id,
        projectId: projects[11].id,
        notes: 'Project cancelled by client. Partial work completed and billed.',
        terms: 'Cancellation terms apply. Payment for completed work only.',
        items: {
          create: [
            {
              description: 'Business Process Analysis',
              quantity: 32,
              unitPrice: 165.00,
              totalPrice: 5280.00,
            },
            {
              description: 'Workflow Documentation',
              quantity: 24,
              unitPrice: 145.00,
              totalPrice: 3480.00,
            },
            {
              description: 'Initial Consultation & Planning',
              quantity: 30,
              unitPrice: 163.00,
              totalPrice: 4890.00,
            },
          ],
        },
      },
    }),
  ]);

  console.log('📄 Created invoices with items');

  // Link some payments to invoices
  await prisma.payment.update({
    where: { id: payments[0].id },
    data: { invoiceId: invoices[0].id },
  });
  
  await prisma.payment.update({
    where: { id: payments[3].id },
    data: { invoiceId: invoices[1].id },
  });
  
  await prisma.payment.update({
    where: { id: payments[7].id },
    data: { invoiceId: invoices[2].id },
  });

  console.log('🔗 Linked payments to invoices');

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

    // Additional tasks for new projects
    // Tasks for HIPAA-Compliant Patient Portal
    prisma.task.create({
      data: {
        title: 'Conduct HIPAA compliance audit',
        description: 'Review all system components for HIPAA compliance requirements and document findings.',
        projectId: projects[6].id,
        userId: users[6].id,
        status: ProjectStatus.COMPLETED,
        priority: Priority.URGENT,
        dueDate: new Date('2024-10-01'),
        completed: true,
        estimatedHours: 24,
        actualHours: 26,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Implement patient authentication system',
        description: 'Develop secure multi-factor authentication for patient portal access.',
        projectId: projects[6].id,
        userId: users[4].id,
        status: ProjectStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        dueDate: new Date('2024-12-15'),
        completed: false,
        estimatedHours: 40,
        actualHours: 28,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Design telemedicine interface',
        description: 'Create user-friendly interface for video consultations with doctors.',
        projectId: projects[6].id,
        userId: users[7].id,
        status: ProjectStatus.PENDING,
        priority: Priority.MEDIUM,
        dueDate: new Date('2025-01-15'),
        completed: false,
        estimatedHours: 32,
      },
    }),

    // Tasks for K-12 Learning Management System
    prisma.task.create({
      data: {
        title: 'Implement accessibility features',
        description: 'Ensure WCAG 2.1 AA compliance for students with disabilities.',
        projectId: projects[7].id,
        userId: users[7].id,
        status: ProjectStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        dueDate: new Date('2024-12-31'),
        completed: false,
        estimatedHours: 48,
        actualHours: 35,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Create parent communication portal',
        description: 'Develop portal for parents to track student progress and communicate with teachers.',
        projectId: projects[7].id,
        userId: users[9].id,
        status: ProjectStatus.COMPLETED,
        priority: Priority.MEDIUM,
        dueDate: new Date('2024-11-30'),
        completed: true,
        estimatedHours: 36,
        actualHours: 32,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Develop mobile learning app',
        description: 'Create companion mobile app for students to access coursework on tablets and phones.',
        projectId: projects[7].id,
        userId: users[4].id,
        status: ProjectStatus.PENDING,
        priority: Priority.MEDIUM,
        dueDate: new Date('2025-03-15'),
        completed: false,
        estimatedHours: 60,
      },
    }),

    // Tasks for High-Frequency Trading Platform
    prisma.task.create({
      data: {
        title: 'Design low-latency architecture',
        description: 'Create system architecture optimized for microsecond-level response times.',
        projectId: projects[8].id,
        userId: users[8].id,
        status: ProjectStatus.PENDING,
        priority: Priority.URGENT,
        dueDate: new Date('2025-02-15'),
        completed: false,
        estimatedHours: 80,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Implement risk management engine',
        description: 'Develop real-time risk assessment and automatic position management system.',
        projectId: projects[8].id,
        userId: users[2].id,
        status: ProjectStatus.PENDING,
        priority: Priority.URGENT,
        dueDate: new Date('2025-05-01'),
        completed: false,
        estimatedHours: 120,
      },
    }),

    // Tasks for Interactive Art Installation
    prisma.task.create({
      data: {
        title: 'Develop AR interaction system',
        description: 'Create augmented reality interactions for gallery visitors using mobile devices.',
        projectId: projects[9].id,
        userId: users[4].id,
        status: ProjectStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        dueDate: new Date('2024-12-01'),
        completed: false,
        estimatedHours: 45,
        actualHours: 30,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Install interactive hardware',
        description: 'Set up sensors, projectors, and interactive displays for the art installation.',
        projectId: projects[9].id,
        userId: users[8].id,
        status: ProjectStatus.PENDING,
        priority: Priority.MEDIUM,
        dueDate: new Date('2025-02-15'),
        completed: false,
        estimatedHours: 24,
      },
    }),

    // Tasks for Global Supply Chain Tracker
    prisma.task.create({
      data: {
        title: 'Implement multi-language support',
        description: 'Add internationalization for English, Spanish, Mandarin, and Portuguese interfaces.',
        projectId: projects[10].id,
        userId: users[4].id,
        status: ProjectStatus.PENDING,
        priority: Priority.HIGH,
        dueDate: new Date('2025-04-01'),
        completed: false,
        estimatedHours: 40,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Integrate shipping APIs',
        description: 'Connect with major shipping providers (FedEx, UPS, DHL) for real-time tracking.',
        projectId: projects[10].id,
        userId: users[2].id,
        status: ProjectStatus.PENDING,
        priority: Priority.MEDIUM,
        dueDate: new Date('2025-06-15'),
        completed: false,
        estimatedHours: 56,
      },
    }),

    // Tasks for cancelled project
    prisma.task.create({
      data: {
        title: 'Document project requirements',
        description: 'Initial analysis and documentation of business process automation needs.',
        projectId: projects[11].id,
        userId: users[6].id,
        status: ProjectStatus.COMPLETED,
        priority: Priority.MEDIUM,
        dueDate: new Date('2024-07-15'),
        completed: true,
        estimatedHours: 16,
        actualHours: 18,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Create workflow mockups',
        description: 'Design initial workflow automation concepts before project cancellation.',
        projectId: projects[11].id,
        userId: users[7].id,
        status: ProjectStatus.CANCELLED,
        priority: Priority.LOW,
        dueDate: new Date('2024-08-01'),
        completed: false,
        estimatedHours: 20,
        actualHours: 8,
      },
    }),

    // Additional diverse tasks across projects
    prisma.task.create({
      data: {
        title: 'Performance optimization review',
        description: 'Analyze and optimize application performance bottlenecks.',
        projectId: projects[0].id,
        userId: users[5].id,
        status: ProjectStatus.PENDING,
        priority: Priority.MEDIUM,
        dueDate: new Date('2024-11-30'),
        completed: false,
        estimatedHours: 28,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Security penetration testing',
        description: 'Conduct comprehensive security testing and vulnerability assessment.',
        projectId: projects[6].id,
        userId: users[5].id,
        status: ProjectStatus.PENDING,
        priority: Priority.URGENT,
        dueDate: new Date('2025-01-31'),
        completed: false,
        estimatedHours: 40,
      },
    }),
    prisma.task.create({
      data: {
        title: 'User experience testing',
        description: 'Conduct usability testing with target user groups and gather feedback.',
        projectId: projects[7].id,
        userId: users[7].id,
        status: ProjectStatus.IN_PROGRESS,
        priority: Priority.MEDIUM,
        dueDate: new Date('2025-01-15'),
        completed: false,
        estimatedHours: 24,
        actualHours: 16,
      },
    }),
  ]);

  console.log('✅ Created tasks');

  // Display summary
  const userCount = await prisma.user.count();
  const clientCount = await prisma.client.count();
  const projectCount = await prisma.project.count();
  const taskCount = await prisma.task.count();
  const paymentCount = await prisma.payment.count();

  console.log('\n🎉 Database seeding completed successfully!');
  console.log(`📊 Summary:`);
  console.log(`   Users: ${userCount}`);
  console.log(`   Clients: ${clientCount}`);
  console.log(`   Projects: ${projectCount}`);
  console.log(`   Tasks: ${taskCount}`);
  console.log(`   Payments: ${paymentCount}`);
  console.log('\n✨ Your database is now populated with diverse, realistic sample data!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
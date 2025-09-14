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
    'user_32QrZJaFb0lghQn40GMG9w7Y0qT',
    'user_3mLkIfHaYZA234BCD',
    'user_4nMlJgIbZAB345CDE'
  ];

  // Create Client Sources
  const clientSources = await Promise.all([
    prisma.clientSource.create({ data: { name: 'Google Ads', clerkId: clerkUserIds[0] } }),
    prisma.clientSource.create({ data: { name: 'LinkedIn', clerkId: clerkUserIds[0] } }),
    prisma.clientSource.create({ data: { name: 'Referral', clerkId: clerkUserIds[0] } }),
    prisma.clientSource.create({ data: { name: 'Website', clerkId: clerkUserIds[0] } }),
    prisma.clientSource.create({ data: { name: 'Social Media', clerkId: clerkUserIds[0] } }),
    prisma.clientSource.create({ data: { name: 'Cold Email', clerkId: clerkUserIds[0] } }),
    prisma.clientSource.create({ data: { name: 'Networking Events', clerkId: clerkUserIds[0] } }),
    prisma.clientSource.create({ data: { name: 'Facebook Ads', clerkId: clerkUserIds[0] } }),
    prisma.clientSource.create({ data: { name: 'Twitter', clerkId: clerkUserIds[0] } }),
    prisma.clientSource.create({ data: { name: 'YouTube', clerkId: clerkUserIds[0] } }),
    prisma.clientSource.create({ data: { name: 'Instagram', clerkId: clerkUserIds[0] } }),
    prisma.clientSource.create({ data: { name: 'TikTok', clerkId: clerkUserIds[0] } }),
    prisma.clientSource.create({ data: { name: 'Upwork', clerkId: clerkUserIds[0] } }),
    prisma.clientSource.create({ data: { name: 'Fiverr', clerkId: clerkUserIds[0] } }),
    prisma.clientSource.create({ data: { name: 'Freelancer', clerkId: clerkUserIds[0] } }),
  ]);

  console.log('📊 Created client sources');

  // Create Clients (25 diverse clients)
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
    prisma.client.create({
      data: {
        name: 'FinanceFlow Pro',
        company: 'FinanceFlow Solutions',
        email: ['admin@financeflow.com'],
        phone: ['+1-555-0789'],
        address: '567 Wall Street, New York, NY 10005',
        website: 'https://financeflow.com',
        notes: 'Financial services company requiring secure solutions.',
        clientSourceId: clientSources[5].id,
        status: ClientStatus.ACTIVE,
        clerkId: clerkUserIds[0],
      },
    }),
    prisma.client.create({
      data: {
        name: 'EduTech Academy',
        company: 'EduTech Learning Systems',
        email: ['info@edutech.edu'],
        phone: ['+1-555-0890'],
        address: '234 Education Blvd, Boston, MA 02101',
        website: 'https://edutech-academy.com',
        notes: 'Educational technology platform for K-12 schools.',
        clientSourceId: clientSources[6].id,
        status: ClientStatus.ACTIVE,
        clerkId: clerkUserIds[0],
      },
    }),
    prisma.client.create({
      data: {
        name: 'FoodieDelight',
        company: 'FoodieDelight Restaurants',
        email: ['orders@foodiedelight.com'],
        phone: ['+1-555-0901'],
        address: '678 Culinary Ave, Los Angeles, CA 90210',
        website: 'https://foodiedelight.com',
        notes: 'Restaurant chain needing online ordering system.',
        clientSourceId: clientSources[7].id,
        status: ClientStatus.ACTIVE,
        clerkId: clerkUserIds[0],
      },
    }),
    prisma.client.create({
      data: {
        name: 'AutoMotive Plus',
        company: 'AutoMotive Plus Dealerships',
        email: ['sales@automotiveplus.com'],
        phone: ['+1-555-1012'],
        address: '890 Motor Way, Detroit, MI 48201',
        website: 'https://automotiveplus.com',
        notes: 'Car dealership network requiring inventory management.',
        clientSourceId: clientSources[8].id,
        status: ClientStatus.ACTIVE,
        clerkId: clerkUserIds[0],
      },
    }),
    prisma.client.create({
      data: {
        name: 'RealEstate Pro',
        company: 'RealEstate Pro Agency',
        email: ['listings@realestatepro.com'],
        phone: ['+1-555-1123'],
        address: '345 Property Lane, Miami, FL 33101',
        website: 'https://realestatepro.com',
        notes: 'Real estate agency needing property management system.',
        clientSourceId: clientSources[9].id,
        status: ClientStatus.ACTIVE,
        clerkId: clerkUserIds[0],
      },
    }),
    prisma.client.create({
      data: {
        name: 'FitnessFirst Gyms',
        company: 'FitnessFirst Health Centers',
        email: ['membership@fitnessfirst.com'],
        phone: ['+1-555-1234'],
        address: '456 Wellness St, Denver, CO 80201',
        website: 'https://fitnessfirst.com',
        notes: 'Gym chain requiring membership management system.',
        clientSourceId: clientSources[10].id,
        status: ClientStatus.ACTIVE,
        clerkId: clerkUserIds[0],
      },
    }),
    prisma.client.create({
      data: {
        name: 'TravelBug Adventures',
        company: 'TravelBug Tourism',
        email: ['bookings@travelbug.com'],
        phone: ['+1-555-1345'],
        address: '789 Adventure Rd, Seattle, WA 98101',
        website: 'https://travelbug.com',
        notes: 'Travel agency needing booking and itinerary system.',
        clientSourceId: clientSources[11].id,
        status: ClientStatus.ACTIVE,
        clerkId: clerkUserIds[0],
      },
    }),
    prisma.client.create({
      data: {
        name: 'PetCare Veterinary',
        company: 'PetCare Animal Hospital',
        email: ['appointments@petcare.com'],
        phone: ['+1-555-1456'],
        address: '123 Animal Ave, Phoenix, AZ 85001',
        website: 'https://petcare-vet.com',
        notes: 'Veterinary clinic needing appointment scheduling system.',
        clientSourceId: clientSources[12].id,
        status: ClientStatus.ACTIVE,
        clerkId: clerkUserIds[0],
      },
    }),
    prisma.client.create({
      data: {
        name: 'LegalEagle Law Firm',
        company: 'LegalEagle Associates',
        email: ['cases@legaleagle.com'],
        phone: ['+1-555-1567'],
        address: '456 Justice Blvd, Washington, DC 20001',
        website: 'https://legaleagle.com',
        notes: 'Law firm requiring case management system.',
        clientSourceId: clientSources[13].id,
        status: ClientStatus.ACTIVE,
        clerkId: clerkUserIds[0],
      },
    }),
    prisma.client.create({
      data: {
        name: 'CloudNine Hosting',
        company: 'CloudNine Technologies',
        email: ['support@cloudnine.com'],
        phone: ['+1-555-1678'],
        address: '789 Server St, San Francisco, CA 94102',
        website: 'https://cloudnine.com',
        notes: 'Web hosting company needing customer portal.',
        clientSourceId: clientSources[14].id,
        status: ClientStatus.ACTIVE,
        clerkId: clerkUserIds[0],
      },
    }),
    prisma.client.create({
      data: {
        name: 'MusicMakers Studio',
        company: 'MusicMakers Entertainment',
        email: ['bookings@musicmakers.com'],
        phone: ['+1-555-1789'],
        address: '234 Melody Lane, Nashville, TN 37201',
        website: 'https://musicmakers.com',
        notes: 'Recording studio needing booking and project management.',
        clientSourceId: clientSources[0].id,
        status: ClientStatus.ACTIVE,
        clerkId: clerkUserIds[0],
      },
    }),
    prisma.client.create({
      data: {
        name: 'FashionForward Boutique',
        company: 'FashionForward Retail',
        email: ['orders@fashionforward.com'],
        phone: ['+1-555-1890'],
        address: '567 Style Ave, New York, NY 10013',
        website: 'https://fashionforward.com',
        notes: 'Fashion retailer needing e-commerce platform.',
        clientSourceId: clientSources[1].id,
        status: ClientStatus.ACTIVE,
        clerkId: clerkUserIds[0],
      },
    }),
    prisma.client.create({
      data: {
        name: 'GreenThumb Landscaping',
        company: 'GreenThumb Services',
        email: ['projects@greenthumb.com'],
        phone: ['+1-555-1901'],
        address: '890 Garden Way, Portland, OR 97203',
        website: 'https://greenthumb.com',
        notes: 'Landscaping company needing project management system.',
        clientSourceId: clientSources[2].id,
        status: ClientStatus.ACTIVE,
        clerkId: clerkUserIds[0],
      },
    }),
    prisma.client.create({
      data: {
        name: 'TechRepair Solutions',
        company: 'TechRepair Inc.',
        email: ['service@techrepair.com'],
        phone: ['+1-555-2012'],
        address: '345 Fix-It Blvd, Austin, TX 78702',
        website: 'https://techrepair.com',
        notes: 'Electronics repair shop needing service tracking system.',
        clientSourceId: clientSources[3].id,
        status: ClientStatus.ACTIVE,
        clerkId: clerkUserIds[0],
      },
    }),
    prisma.client.create({
      data: {
        name: 'ArtGallery Modern',
        company: 'ArtGallery Modern Exhibitions',
        email: ['curator@artgallery.com'],
        phone: ['+1-555-2123'],
        address: '678 Creative St, Chicago, IL 60601',
        website: 'https://artgallery-modern.com',
        notes: 'Art gallery needing exhibition management system.',
        clientSourceId: clientSources[4].id,
        status: ClientStatus.ACTIVE,
        clerkId: clerkUserIds[0],
      },
    }),
    prisma.client.create({
      data: {
        name: 'SportsPro Equipment',
        company: 'SportsPro Athletic Gear',
        email: ['sales@sportspro.com'],
        phone: ['+1-555-2534'],
        address: '123 Athletic Ave, Atlanta, GA 30301',
        website: 'https://sportspro.com',
        notes: 'Sports equipment retailer needing inventory system.',
        clientSourceId: clientSources[5].id,
        status: ClientStatus.ACTIVE,
        clerkId: clerkUserIds[0],
      },
    }),
    prisma.client.create({
      data: {
        name: 'BookWorm Publishing',
        company: 'BookWorm Media Group',
        email: ['manuscripts@bookworm.com'],
        phone: ['+1-555-2345'],
        address: '456 Literature Lane, Boston, MA 02102',
        website: 'https://bookworm-publishing.com',
        notes: 'Publishing house needing manuscript management system.',
        clientSourceId: clientSources[6].id,
        status: ClientStatus.ACTIVE,
        clerkId: clerkUserIds[0],
      },
    }),
    prisma.client.create({
      data: {
        name: 'CraftBeer Brewery',
        company: 'CraftBeer Artisan Brewing',
        email: ['orders@craftbeer.com'],
        phone: ['+1-555-2456'],
        address: '789 Hops Street, Portland, OR 97204',
        website: 'https://craftbeer-brewery.com',
        notes: 'Craft brewery needing production and distribution system.',
        clientSourceId: clientSources[7].id,
        status: ClientStatus.ACTIVE,
        clerkId: clerkUserIds[0],
      },
    }),
    prisma.client.create({
      data: {
        name: 'WeddingBliss Planners',
        company: 'WeddingBliss Events',
        email: ['events@weddingbliss.com'],
        phone: ['+1-555-2567'],
        address: '234 Romance Rd, Las Vegas, NV 89101',
        website: 'https://weddingbliss.com',
        notes: 'Wedding planning company needing event management system.',
        clientSourceId: clientSources[8].id,
        status: ClientStatus.ACTIVE,
        clerkId: clerkUserIds[0],
      },
    }),
    prisma.client.create({
      data: {
        name: 'SmartHome Solutions',
        company: 'SmartHome Technologies',
        email: ['install@smarthome.com'],
        phone: ['+1-555-2678'],
        address: '567 Innovation Dr, San Jose, CA 95101',
        website: 'https://smarthome-solutions.com',
        notes: 'Smart home installation company needing scheduling system.',
        clientSourceId: clientSources[9].id,
        status: ClientStatus.ACTIVE,
        clerkId: clerkUserIds[0],
      },
    }),
  ]);

  console.log('🏢 Created clients');

  // Create Projects (40+ diverse projects)
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: 'E-commerce Platform Redesign',
        description: 'Complete redesign and development of the client\'s e-commerce platform.',
        clientId: clients[0].id,
        clerkId: clerkUserIds[0],
        deliverables: ['UI/UX Design', 'Frontend Development', 'Backend API', 'Payment Integration'],
        status: ProjectStatus.COMPLETED,
        priority: Priority.HIGH,
        startDate: new Date('2025-03-15'),
        endDate: new Date('2025-05-30'),
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
        status: ProjectStatus.COMPLETED,
        priority: Priority.MEDIUM,
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-08-31'),
        budget: 45000.00,
        tags: ['dashboard', 'data-visualization', 'environmental', 'react'],
      },
    }),
    prisma.project.create({
      data: {
        name: 'Retail Inventory Management System',
        description: 'Complete inventory management solution for retail chain.',
        clientId: clients[2].id,
        clerkId: clerkUserIds[0],
        deliverables: ['System Architecture', 'Database Design', 'API Development', 'Mobile App'],
        status: ProjectStatus.COMPLETED,
        priority: Priority.HIGH,
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-12-15'),
        budget: 120000.00,
        tags: ['inventory', 'retail', 'mobile', 'api'],
      },
    }),
    prisma.project.create({
      data: {
        name: 'Startup MVP Development',
        description: 'Minimum viable product development for tech startup.',
        clientId: clients[3].id,
        clerkId: clerkUserIds[0],
        deliverables: ['MVP Design', 'Core Features', 'User Authentication', 'Deployment'],
        status: ProjectStatus.COMPLETED,
        priority: Priority.HIGH,
        startDate: new Date('2025-09-01'),
        endDate: new Date('2026-01-30'),
        budget: 65000.00,
        tags: ['mvp', 'startup', 'react', 'firebase'],
      },
    }),
    prisma.project.create({
      data: {
        name: 'Healthcare HIPAA Compliance System',
        description: 'HIPAA compliant patient management system.',
        clientId: clients[4].id,
        clerkId: clerkUserIds[0],
        deliverables: ['Security Audit', 'Compliance Implementation', 'Patient Portal', 'Staff Training'],
        status: ProjectStatus.COMPLETED,
        priority: Priority.HIGH,
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-07-31'),
        budget: 95000.00,
        tags: ['healthcare', 'hipaa', 'security', 'compliance'],
      },
    }),
    prisma.project.create({
      data: {
        name: 'Financial Trading Platform',
        description: 'Real-time trading platform with advanced analytics.',
        clientId: clients[5].id,
        clerkId: clerkUserIds[0],
        deliverables: ['Trading Engine', 'Real-time Data', 'Analytics Dashboard', 'Mobile App'],
        status: ProjectStatus.COMPLETED,
        priority: Priority.HIGH,
        startDate: new Date('2025-04-01'),
        endDate: new Date('2025-11-30'),
        budget: 150000.00,
        tags: ['fintech', 'trading', 'real-time', 'analytics'],
      },
    }),
    prisma.project.create({
      data: {
        name: 'Educational Learning Management System',
        description: 'Comprehensive LMS for K-12 education.',
        clientId: clients[6].id,
        clerkId: clerkUserIds[0],
        deliverables: ['Course Management', 'Student Portal', 'Teacher Dashboard', 'Parent Access'],
        status: ProjectStatus.COMPLETED,
        priority: Priority.MEDIUM,
        startDate: new Date('2025-08-15'),
        endDate: new Date('2026-02-28'),
        budget: 75000.00,
        tags: ['education', 'lms', 'k12', 'portal'],
      },
    }),
    prisma.project.create({
      data: {
        name: 'Restaurant Online Ordering System',
        description: 'Multi-location online ordering and delivery system.',
        clientId: clients[7].id,
        clerkId: clerkUserIds[0],
        deliverables: ['Online Menu', 'Order Management', 'Payment Processing', 'Delivery Tracking'],
        status: ProjectStatus.COMPLETED,
        priority: Priority.MEDIUM,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-05-15'),
        budget: 55000.00,
        tags: ['restaurant', 'ordering', 'delivery', 'payments'],
      },
    }),
    prisma.project.create({
      data: {
        name: 'Automotive Inventory Management',
        description: 'Vehicle inventory and sales management system.',
        clientId: clients[8].id,
        clerkId: clerkUserIds[0],
        deliverables: ['Inventory Tracking', 'Sales Pipeline', 'Customer CRM', 'Reporting'],
        status: ProjectStatus.IN_PROGRESS,
        priority: Priority.MEDIUM,
        startDate: new Date('2025-08-01'),
        endDate: new Date('2026-01-30'),
        budget: 80000.00,
        tags: ['automotive', 'inventory', 'crm', 'sales'],
      },
    }),
    prisma.project.create({
      data: {
        name: 'Real Estate Property Management',
        description: 'Comprehensive property listing and management platform.',
        clientId: clients[9].id,
        clerkId: clerkUserIds[0],
        deliverables: ['Property Listings', 'Client Portal', 'Document Management', 'Virtual Tours'],
        status: ProjectStatus.COMPLETED,
        priority: Priority.MEDIUM,
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-06-30'),
        budget: 70000.00,
        tags: ['real-estate', 'property', 'listings', 'virtual-tours'],
      },
    }),
    prisma.project.create({
      data: {
        name: 'Gym Membership Management System',
        description: 'Complete gym management with member tracking.',
        clientId: clients[10].id,
        clerkId: clerkUserIds[0],
        deliverables: ['Member Portal', 'Class Scheduling', 'Payment Processing', 'Fitness Tracking'],
        status: ProjectStatus.IN_PROGRESS,
        priority: Priority.LOW,
        startDate: new Date('2025-09-15'),
        endDate: new Date('2026-02-15'),
        budget: 45000.00,
        tags: ['fitness', 'membership', 'scheduling', 'payments'],
      },
    }),
    prisma.project.create({
      data: {
        name: 'Travel Booking Platform',
        description: 'Multi-service travel booking and itinerary management.',
        clientId: clients[11].id,
        clerkId: clerkUserIds[0],
        deliverables: ['Booking Engine', 'Itinerary Builder', 'Payment Gateway', 'Mobile App'],
        status: ProjectStatus.COMPLETED,
        priority: Priority.HIGH,
        startDate: new Date('2025-10-15'),
        endDate: new Date('2026-03-31'),
        budget: 90000.00,
        tags: ['travel', 'booking', 'itinerary', 'mobile'],
      },
    }),
    prisma.project.create({
      data: {
        name: 'Veterinary Practice Management',
        description: 'Complete veterinary clinic management system.',
        clientId: clients[12].id,
        clerkId: clerkUserIds[0],
        deliverables: ['Appointment Scheduling', 'Patient Records', 'Billing System', 'Inventory'],
        status: ProjectStatus.IN_PROGRESS,
        priority: Priority.MEDIUM,
        startDate: new Date('2025-10-15'),
        endDate: new Date('2026-03-15'),
        budget: 60000.00,
        tags: ['veterinary', 'appointments', 'records', 'billing'],
      },
    }),
    prisma.project.create({
      data: {
        name: 'Legal Case Management System',
        description: 'Comprehensive case and client management for law firm.',
        clientId: clients[13].id,
        clerkId: clerkUserIds[0],
        deliverables: ['Case Tracking', 'Document Management', 'Time Billing', 'Client Portal'],
        status: ProjectStatus.COMPLETED,
        priority: Priority.HIGH,
        startDate: new Date('2025-03-15'),
        endDate: new Date('2025-08-30'),
        budget: 85000.00,
        tags: ['legal', 'case-management', 'billing', 'documents'],
      },
    }),
    prisma.project.create({
      data: {
        name: 'Cloud Hosting Customer Portal',
        description: 'Self-service customer portal for hosting services.',
        clientId: clients[14].id,
        clerkId: clerkUserIds[0],
        deliverables: ['Account Management', 'Service Monitoring', 'Billing Integration', 'Support Tickets'],
        status: ProjectStatus.IN_PROGRESS,
        priority: Priority.MEDIUM,
        startDate: new Date('2025-11-15'),
        endDate: new Date('2026-05-15'),
        budget: 65000.00,
        tags: ['hosting', 'portal', 'monitoring', 'support'],
      },
    }),
    prisma.project.create({
      data: {
        name: 'Music Studio Booking System',
        description: 'Studio booking and project management for recording studio.',
        clientId: clients[15].id,
        clerkId: clerkUserIds[0],
        deliverables: ['Studio Scheduling', 'Project Tracking', 'Equipment Management', 'Client Portal'],
        status: ProjectStatus.COMPLETED,
        priority: Priority.LOW,
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-10-15'),
        budget: 35000.00,
        tags: ['music', 'studio', 'booking', 'equipment'],
      },
    }),
    prisma.project.create({
      data: {
        name: 'Fashion E-commerce Platform',
        description: 'High-end fashion e-commerce with AR try-on features.',
        clientId: clients[16].id,
        clerkId: clerkUserIds[0],
        deliverables: ['E-commerce Site', 'AR Integration', 'Inventory System', 'Mobile App'],
        status: ProjectStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        startDate: new Date('2024-12-01'),
        endDate: new Date('2025-06-30'),
        budget: 110000.00,
        tags: ['fashion', 'e-commerce', 'ar', 'mobile'],
      },
    }),
    prisma.project.create({
      data: {
        name: 'Landscaping Project Management',
        description: 'Project management system for landscaping services.',
        clientId: clients[17].id,
        clerkId: clerkUserIds[0],
        deliverables: ['Project Planning', 'Resource Management', 'Client Communication', 'Billing'],
        status: ProjectStatus.COMPLETED,
        priority: Priority.MEDIUM,
        startDate: new Date('2025-04-15'),
        endDate: new Date('2025-09-15'),
        budget: 40000.00,
        tags: ['landscaping', 'project-management', 'resources', 'billing'],
      },
    }),
    prisma.project.create({
      data: {
        name: 'Electronics Repair Tracking',
        description: 'Service tracking and customer management system.',
        clientId: clients[18].id,
        clerkId: clerkUserIds[0],
        deliverables: ['Service Tracking', 'Parts Inventory', 'Customer Portal', 'Billing System'],
        status: ProjectStatus.IN_PROGRESS,
        priority: Priority.LOW,
        startDate: new Date('2024-10-01'),
        endDate: new Date('2025-02-28'),
        budget: 30000.00,
        tags: ['repair', 'tracking', 'inventory', 'billing'],
      },
    }),
    prisma.project.create({
      data: {
        name: 'Art Gallery Exhibition Management',
        description: 'Exhibition planning and artwork management system.',
        clientId: clients[19].id,
        clerkId: clerkUserIds[0],
        deliverables: ['Exhibition Planning', 'Artwork Catalog', 'Visitor Management', 'Sales Tracking'],
        status: ProjectStatus.COMPLETED,
        priority: Priority.MEDIUM,
        startDate: new Date('2025-05-15'),
        endDate: new Date('2025-10-31'),
        budget: 50000.00,
        tags: ['art', 'gallery', 'exhibitions', 'catalog'],
      },
    }),
    // Historical projects from 2021-2025
    prisma.project.create({
      data: {
        name: 'Legacy System Migration',
        description: 'Migration of legacy systems to modern architecture.',
        clientId: clients[0].id,
        clerkId: clerkUserIds[0],
        deliverables: ['System Analysis', 'Migration Plan', 'Data Transfer', 'Testing'],
        status: ProjectStatus.COMPLETED,
        priority: Priority.HIGH,
        startDate: new Date('2021-03-01'),
        endDate: new Date('2021-09-30'),
        budget: 125000.00,
        tags: ['migration', 'legacy', 'modernization'],
      },
    }),
    prisma.project.create({
      data: {
        name: 'Mobile Banking App',
        description: 'Secure mobile banking application development.',
        clientId: clients[5].id,
        clerkId: clerkUserIds[0],
        deliverables: ['Mobile App', 'Security Implementation', 'API Integration', 'Testing'],
        status: ProjectStatus.COMPLETED,
        priority: Priority.HIGH,
        startDate: new Date('2021-06-01'),
        endDate: new Date('2025-01-15'),
        budget: 180000.00,
        tags: ['mobile', 'banking', 'security', 'fintech'],
      },
    }),
    prisma.project.create({
      data: {
        name: 'E-learning Platform',
        description: 'Comprehensive online learning platform.',
        clientId: clients[6].id,
        clerkId: clerkUserIds[0],
        deliverables: ['Platform Development', 'Content Management', 'Video Streaming', 'Assessment Tools'],
        status: ProjectStatus.COMPLETED,
        priority: Priority.MEDIUM,
        startDate: new Date('2021-09-01'),
        endDate: new Date('2025-04-30'),
        budget: 95000.00,
        tags: ['e-learning', 'education', 'video', 'assessment'],
      },
    }),
    prisma.project.create({
      data: {
        name: 'Supply Chain Management',
        description: 'End-to-end supply chain management system.',
        clientId: clients[2].id,
        clerkId: clerkUserIds[0],
        deliverables: ['Inventory Tracking', 'Supplier Management', 'Logistics', 'Reporting'],
        status: ProjectStatus.COMPLETED,
        priority: Priority.HIGH,
        startDate: new Date('2021-11-01'),
        endDate: new Date('2025-06-15'),
        budget: 140000.00,
        tags: ['supply-chain', 'logistics', 'inventory', 'suppliers'],
      },
    }),
    prisma.project.create({
      data: {
        name: 'IoT Device Management',
        description: 'IoT device monitoring and management platform.',
        clientId: clients[24].id,
        clerkId: clerkUserIds[0],
        deliverables: ['Device Management', 'Real-time Monitoring', 'Analytics Dashboard', 'Mobile App'],
        status: ProjectStatus.COMPLETED,
        priority: Priority.HIGH,
        startDate: new Date('2025-08-01'),
        endDate: new Date('2025-02-28'),
        budget: 105000.00,
        tags: ['iot', 'monitoring', 'analytics', 'devices'],
      },
    }),
    prisma.project.create({
      data: {
        name: 'Blockchain Integration',
        description: 'Blockchain technology integration for secure transactions.',
        clientId: clients[5].id,
        clerkId: clerkUserIds[0],
        deliverables: ['Blockchain Implementation', 'Smart Contracts', 'Security Audit', 'Integration'],
        status: ProjectStatus.COMPLETED,
        priority: Priority.HIGH,
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-08-30'),
        budget: 165000.00,
        tags: ['blockchain', 'smart-contracts', 'security', 'fintech'],
      },
    }),
    prisma.project.create({
      data: {
        name: 'AI Chatbot Development',
        description: 'AI-powered customer service chatbot.',
        clientId: clients[7].id,
        clerkId: clerkUserIds[0],
        deliverables: ['AI Model Training', 'Chatbot Development', 'Integration', 'Analytics'],
        status: ProjectStatus.COMPLETED,
        priority: Priority.MEDIUM,
        startDate: new Date('2025-05-01'),
        endDate: new Date('2025-11-15'),
        budget: 75000.00,
        tags: ['ai', 'chatbot', 'nlp', 'customer-service'],
      },
    }),
    prisma.project.create({
      data: {
        name: 'Data Analytics Platform',
        description: 'Advanced data analytics and visualization platform.',
        clientId: clients[1].id,
        clerkId: clerkUserIds[0],
        deliverables: ['Data Pipeline', 'Analytics Engine', 'Visualization Dashboard', 'Reporting'],
        status: ProjectStatus.COMPLETED,
        priority: Priority.HIGH,
        startDate: new Date('2025-09-01'),
        endDate: new Date('2024-04-30'),
        budget: 115000.00,
        tags: ['analytics', 'data-science', 'visualization', 'reporting'],
      },
    }),
    prisma.project.create({
      data: {
        name: 'Cybersecurity Audit System',
        description: 'Comprehensive cybersecurity monitoring and audit system.',
        clientId: clients[4].id,
        clerkId: clerkUserIds[0],
        deliverables: ['Security Assessment', 'Monitoring System', 'Compliance Reports', 'Training'],
        status: ProjectStatus.COMPLETED,
        priority: Priority.HIGH,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-07-31'),
        budget: 135000.00,
        tags: ['cybersecurity', 'monitoring', 'compliance', 'audit'],
      },
    }),
  ]);

  console.log('📋 Created projects');

  // Create Payments (300+ diverse payments across 2021-2025)
  const payments = [];
  
  // Generate payments for each project with multiple milestones
  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    const client = clients[i % clients.length];
    const projectBudget = project.budget;
    
    // Create 3-6 payments per project
    const paymentCount = Math.floor(Math.random() * 4) + 3;
    const paymentAmount = Number(projectBudget) / paymentCount;
    
    for (let j = 0; j < paymentCount; j++) {
      const paymentMethods = [PaymentMethod.BANK_TRANSFER, PaymentMethod.STRIPE, PaymentMethod.PAYPAL, PaymentMethod.CHEQUE, PaymentMethod.CASH];
      const paymentTypes = [PaymentType.ADVANCE, PaymentType.MILESTONE, PaymentType.FINAL, PaymentType.FULL_PAYMENT];
      
      // Create payment dates spread across the project timeline
      const startDate = new Date(project.startDate || new Date());
      const endDate = new Date(project.endDate || new Date());
      const timeDiff = endDate.getTime() - startDate.getTime();
      const paymentDate = new Date(startDate.getTime() + (timeDiff * j / paymentCount));
      
      // Determine payment status based on date
      let paymentStatus: PaymentStatus = PaymentStatus.COMPLETED;
      if (project.status === ProjectStatus.IN_PROGRESS && j === paymentCount - 1) {
        paymentStatus = PaymentStatus.PENDING;
      } else if (paymentDate > new Date('2024-11-01') && Math.random() > 0.7) {
        paymentStatus = PaymentStatus.PENDING;
      } else if (Math.random() > 0.95) {
        paymentStatus = PaymentStatus.FAILED;
      }
      
      const payment = await prisma.payment.create({
        data: {
          amount: Math.round(paymentAmount * 100) / 100,
          date: paymentDate,
          description: `${project.name} - Payment ${j + 1}`,
          type: paymentTypes[j % paymentTypes.length],
          method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
          status: paymentStatus,
          projectId: project.id,
          clientId: client.id,
        },
      });
      payments.push(payment);
    }
  }
  
  // Add historical monthly payments across all years and months
  const historicalPayments = [];
  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  const years = ['2025'];
  
  for (const year of years) {
    for (const month of months) {
      // Add 2-5 random payments per month
      const monthlyPayments = Math.floor(Math.random() * 4) + 2;
      for (let i = 0; i < monthlyPayments; i++) {
        const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
        const randomClient = clients[Math.floor(Math.random() * clients.length)];
        const randomProject = projects[Math.floor(Math.random() * projects.length)];
        const amounts = [2500, 5000, 7500, 10000, 12500, 15000, 20000, 25000, 30000, 35000, 40000];
        const randomAmount = amounts[Math.floor(Math.random() * amounts.length)];
        
        let status: PaymentStatus = PaymentStatus.COMPLETED;
        if (year === '2024' && parseInt(month) >= 11) {
          status = Math.random() > 0.6 ? PaymentStatus.PENDING : PaymentStatus.COMPLETED;
        } else if (Math.random() > 0.98) {
          status = PaymentStatus.FAILED;
        }
        
        const payment = await prisma.payment.create({
          data: {
            amount: randomAmount,
            date: new Date(`${year}-${month}-${day}`),
            description: `Monthly service payment - ${month}/${year}`,
            type: [PaymentType.FULL_PAYMENT, PaymentType.MILESTONE, PaymentType.ADVANCE][Math.floor(Math.random() * 3)],
            method: [PaymentMethod.BANK_TRANSFER, PaymentMethod.STRIPE, PaymentMethod.PAYPAL, PaymentMethod.CHEQUE][Math.floor(Math.random() * 4)],
            status: status,
            projectId: randomProject.id,
            clientId: randomClient.id,
          },
        });
        historicalPayments.push(payment);
      }
    }
  }

  // Add 2025 monthly payments from March up to the current date
  const now = new Date();
  if (now.getFullYear() === 2025) {
    // JavaScript months are 0-indexed; March is 2
    const startMonthIdx = 2; // March
    const currentMonthIdx = now.getMonth();
    for (let m = startMonthIdx; m <= currentMonthIdx; m++) {
      const year = 2025;
      // If current month, constrain day up to 'now'; else allow up to 28 to avoid month-length issues
      const maxDay = m === currentMonthIdx ? now.getDate() : 28;
      // Add 2-5 random payments per month
      const monthlyPayments = Math.floor(Math.random() * 4) + 2;
      for (let i = 0; i < monthlyPayments; i++) {
        const dayNum = Math.max(1, Math.floor(Math.random() * maxDay));
        const day = String(dayNum).padStart(2, '0');
        const month = String(m + 1).padStart(2, '0');
        const randomClient = clients[Math.floor(Math.random() * clients.length)];
        const randomProject = projects[Math.floor(Math.random() * projects.length)];
        const amounts = [2500, 5000, 7500, 10000, 12500, 15000, 20000, 25000, 30000, 35000, 40000];
        const randomAmount = amounts[Math.floor(Math.random() * amounts.length)];
        
        // In 2025, mark some payments as pending in the current month to simulate in-progress activity
        let status: PaymentStatus = PaymentStatus.COMPLETED;
        if (m === currentMonthIdx) {
          status = Math.random() > 0.5 ? PaymentStatus.PENDING : PaymentStatus.COMPLETED;
        } else if (Math.random() > 0.98) {
          status = PaymentStatus.FAILED;
        }
        
        const payment = await prisma.payment.create({
          data: {
            amount: randomAmount,
            date: new Date(`${year}-${month}-${day}`),
            description: `Monthly service payment - ${month}/${year}`,
            type: [PaymentType.ADVANCE, PaymentType.MILESTONE, PaymentType.PARTIAL][Math.floor(Math.random() * 3)],
            method: [PaymentMethod.BANK_TRANSFER, PaymentMethod.STRIPE, PaymentMethod.PAYPAL, PaymentMethod.CHEQUE][Math.floor(Math.random() * 4)],
            status,
            projectId: randomProject.id,
            clientId: randomClient.id,
          },
        });
        historicalPayments.push(payment);
      }
    }
  }
  
  payments.push(...historicalPayments);

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
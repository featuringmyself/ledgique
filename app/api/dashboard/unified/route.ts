import prisma from "@/lib/prisma";

export async function GET() {
  const userId = "user_32QrZJaFb0lghQn40GMG9w7Y0qT";
  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  // Single query to get all necessary data
  const [
    recentPayments,
    recentProjects,
    recentClients,
    activeClients,
    allClientsForTrends,
    allProjectsForTrends,
    projectStatusCounts
  ] = await Promise.all([
    // Recent payments
    prisma.payment.findMany({
      where: { project: { clerkId: userId } },
      select: {
        id: true,
        amount: true,
        date: true,
        status: true,
        client: { select: { name: true } },
        project: { select: { name: true } }
      },
      orderBy: { date: 'desc' },
      take: 3
    }),

    // Recent projects
    prisma.project.findMany({
      where: { clerkId: userId },
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
        client: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 3
    }),

    // Recent clients
    prisma.client.findMany({
      where: { clerkId: userId },
      select: {
        id: true,
        name: true,
        company: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 3
    }),

    // Active clients with sources
    prisma.client.findMany({
      where: {
        clerkId: userId,
        status: 'ACTIVE'
      },
      select: {
        clientSource: {
          select: { name: true }
        }
      }
    }),

    // All active clients for last 12 months (for trends)
    prisma.client.findMany({
      where: {
        clerkId: userId,
        createdAt: { gte: twelveMonthsAgo },
        status: 'ACTIVE'
      },
      select: {
        createdAt: true
      }
    }),

    // All projects for last 12 months (for trends)
    prisma.project.findMany({
      where: {
        clerkId: userId,
        createdAt: { gte: twelveMonthsAgo },
        status: { in: ['IN_PROGRESS', 'COMPLETED'] }
      },
      select: {
        createdAt: true
      }
    }),

    // Project status distribution
    prisma.project.groupBy({
      by: ['status'],
      where: { clerkId: userId },
      _count: { status: true }
    })
  ]);

  // Process monthly trends in memory (much faster than 12 separate queries)
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    
    const clientCount = allClientsForTrends.filter(
      c => c.createdAt >= startDate && c.createdAt < endDate
    ).length;
    
    const projectCount = allProjectsForTrends.filter(
      p => p.createdAt >= startDate && p.createdAt < endDate
    ).length;

    months.push({
      month: startDate.toLocaleDateString('en-US', { month: 'short' }),
      clients: clientCount,
      projects: projectCount
    });
  }

  // Process project status data
  const colors = {
    'PENDING': '#f59e0b',
    'IN_PROGRESS': '#3b82f6',
    'COMPLETED': '#10b981',
    'CANCELLED': '#ef4444',
    'ON_HOLD': '#8b5cf6'
  };

  const projectStatusData = projectStatusCounts.map(item => ({
    name: item.status.replace(/_/g, ' '),
    value: item._count.status,
    color: colors[item.status as keyof typeof colors] || '#6b7280'
  }));

  return Response.json({
    recentPayments,
    recentProjects,
    recentClients,
    clients: activeClients,
    monthlyTrends: months,
    projectStatusData
  });
}
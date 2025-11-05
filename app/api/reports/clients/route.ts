import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Default to last 12 months if no dates provided
    const now = new Date();
    const defaultStartDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const defaultEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const start = startDate ? new Date(startDate) : defaultStartDate;
    const end = endDate ? new Date(endDate) : defaultEndDate;

    // Get all clients
    const clients = await prisma.client.findMany({
      where: {
        clerkId: userId,
      },
      include: {
        projects: {
          include: {
            payments: {
              where: {
                date: { gte: start, lte: end },
              },
            },
          },
        },
        payments: {
          where: {
            date: { gte: start, lte: end },
          },
        },
        invoices: {
          where: {
            issueDate: { gte: start, lte: end },
          },
        },
        clientSource: true,
      },
    });

    // Calculate client metrics
    const clientMetrics = clients.map((client) => {
      const totalRevenue = client.payments
        .filter(p => p.status === 'COMPLETED')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const totalProjects = client.projects.length;
      const activeProjects = client.projects.filter(
        p => p.status === 'IN_PROGRESS' || p.status === 'PENDING'
      ).length;

      const totalInvoices = client.invoices.length;
      const paidInvoices = client.invoices.filter(i => i.status === 'PAID').length;

      const averageProjectValue = totalProjects > 0
        ? client.projects.reduce((sum, p) => sum + Number(p.budget || 0), 0) / totalProjects
        : 0;

      return {
        id: client.id,
        name: client.name,
        company: client.company,
        email: client.email[0] || '',
        status: client.status,
        clientSource: client.clientSource?.name || 'Unknown',
        totalRevenue,
        totalProjects,
        activeProjects,
        totalInvoices,
        paidInvoices,
        averageProjectValue,
        createdAt: client.createdAt,
      };
    });

    // Sort by revenue
    const topClients = [...clientMetrics]
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    // Client acquisition over time (monthly)
    const acquisitionData: Record<string, number> = {};
    clients.forEach((client) => {
      const date = new Date(client.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      acquisitionData[key] = (acquisitionData[key] || 0) + 1;
    });

    // Revenue by client source
    const revenueBySource = clientMetrics.reduce((acc, client) => {
      const source = client.clientSource;
      if (!acc[source]) {
        acc[source] = { revenue: 0, count: 0 };
      }
      acc[source].revenue += client.totalRevenue;
      acc[source].count++;
      return acc;
    }, {} as Record<string, { revenue: number; count: number }>);

    // Status breakdown
    const statusBreakdown = clientMetrics.reduce((acc, client) => {
      acc[client.status] = (acc[client.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Summary statistics
    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.status === 'ACTIVE').length;
    const totalRevenue = clientMetrics.reduce((sum, c) => sum + c.totalRevenue, 0);
    const averageRevenuePerClient = totalClients > 0 ? totalRevenue / totalClients : 0;

    return NextResponse.json({
      summary: {
        totalClients,
        activeClients,
        totalRevenue,
        averageRevenuePerClient,
      },
      topClients,
      clientMetrics,
      acquisitionData: Object.entries(acquisitionData)
        .map(([period, count]) => ({ period, count }))
        .sort((a, b) => a.period.localeCompare(b.period)),
      revenueBySource: Object.entries(revenueBySource).map(([source, data]) => ({
        source,
        revenue: data.revenue,
        count: data.count,
        percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
      })),
      statusBreakdown: Object.entries(statusBreakdown).map(([status, count]) => ({
        status,
        count,
        percentage: totalClients > 0 ? (count / totalClients) * 100 : 0,
      })),
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching client reports:', error);
    return NextResponse.json({ error: 'Failed to fetch client reports' }, { status: 500 });
  }
}


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
    const groupBy = searchParams.get('groupBy') || 'month'; // month, week, day, year

    // Default to last 12 months if no dates provided
    const now = new Date();
    const defaultStartDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const defaultEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const start = startDate ? new Date(startDate) : defaultStartDate;
    const end = endDate ? new Date(endDate) : defaultEndDate;

    // Get all payments in the date range
    const payments = await prisma.payment.findMany({
      where: {
        project: { clerkId: userId },
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        client: {
          select: { name: true, company: true },
        },
        project: {
          select: { name: true, status: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    // Calculate totals
    const totalRevenue = payments
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const totalPending = payments
      .filter(p => p.status === 'PENDING')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const totalFailed = payments
      .filter(p => p.status === 'FAILED')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // Group by payment method
    const methodBreakdown = payments.reduce((acc, payment) => {
      const method = payment.method;
      if (!acc[method]) {
        acc[method] = { count: 0, total: 0 };
      }
      acc[method].count++;
      if (payment.status === 'COMPLETED') {
        acc[method].total += Number(payment.amount);
      }
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    // Group by status
    const statusBreakdown = payments.reduce((acc, payment) => {
      const status = payment.status;
      if (!acc[status]) {
        acc[status] = { count: 0, total: 0 };
      }
      acc[status].count++;
      acc[status].total += Number(payment.amount);
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    // Time series data based on groupBy
    const timeSeriesData: Record<string, { revenue: number; count: number }> = {};
    
    payments.forEach((payment) => {
      let key: string;
      const date = new Date(payment.date);
      
      switch (groupBy) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'year':
          key = date.getFullYear().toString();
          break;
        case 'month':
        default:
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
      }
      
      if (!timeSeriesData[key]) {
        timeSeriesData[key] = { revenue: 0, count: 0 };
      }
      
      if (payment.status === 'COMPLETED') {
        timeSeriesData[key].revenue += Number(payment.amount);
      }
      timeSeriesData[key].count++;
    });

    // Top clients by revenue
    const clientRevenue = payments
      .filter(p => p.status === 'COMPLETED')
      .reduce((acc, payment) => {
        const clientId = payment.clientId;
        if (!acc[clientId]) {
          acc[clientId] = {
            clientId: payment.clientId,
            clientName: payment.client.name,
            total: 0,
            count: 0,
          };
        }
        acc[clientId].total += Number(payment.amount);
        acc[clientId].count++;
        return acc;
      }, {} as Record<string, { clientId: string; clientName: string; total: number; count: number }>);

    const topClients = Object.values(clientRevenue)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // Average payment amount
    const completedPayments = payments.filter(p => p.status === 'COMPLETED');
    const averagePayment = completedPayments.length > 0
      ? completedPayments.reduce((sum, p) => sum + Number(p.amount), 0) / completedPayments.length
      : 0;

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalPending,
        totalFailed,
        totalPayments: payments.length,
        completedPayments: completedPayments.length,
        averagePayment,
      },
      timeSeries: Object.entries(timeSeriesData)
        .map(([period, data]) => ({ period, ...data }))
        .sort((a, b) => a.period.localeCompare(b.period)),
      methodBreakdown: Object.entries(methodBreakdown).map(([method, data]) => ({
        method,
        count: data.count,
        total: data.total,
        percentage: totalRevenue > 0 ? (data.total / totalRevenue) * 100 : 0,
      })),
      statusBreakdown: Object.entries(statusBreakdown).map(([status, data]) => ({
        status,
        count: data.count,
        total: data.total,
      })),
      topClients,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching payment reports:', error);
    return NextResponse.json({ error: 'Failed to fetch payment reports' }, { status: 500 });
  }
}


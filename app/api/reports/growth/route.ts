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
    const period = searchParams.get('period') || 'year'; // year, quarter, month

    const now = new Date();
    let startDate: Date;
    let compareStartDate: Date;

    switch (period) {
      case 'quarter':
        // Last 3 months vs previous 3 months
        startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        compareStartDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        break;
      case 'month':
        // Last month vs previous month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        compareStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
      case 'year':
      default:
        // Last 12 months vs previous 12 months
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        compareStartDate = new Date(now.getFullYear() - 2, now.getMonth(), 1);
        break;
    }

    const compareEndDate = new Date(startDate.getTime() - 1);
    const endDate = now;

    // Get current period data
    const [currentPayments, currentClients, currentProjects, currentExpenses] = await Promise.all([
      prisma.payment.findMany({
        where: {
          project: { clerkId: userId },
          date: { gte: startDate, lte: endDate },
        },
      }),
      prisma.client.findMany({
        where: {
          clerkId: userId,
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      prisma.project.findMany({
        where: {
          clerkId: userId,
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      prisma.expense.findMany({
        where: {
          clerkId: userId,
          date: { gte: startDate, lte: endDate },
        },
      }),
    ]);

    // Get previous period data
    const [previousPayments, previousClients, previousProjects, previousExpenses] = await Promise.all([
      prisma.payment.findMany({
        where: {
          project: { clerkId: userId },
          date: { gte: compareStartDate, lte: compareEndDate },
        },
      }),
      prisma.client.findMany({
        where: {
          clerkId: userId,
          createdAt: { gte: compareStartDate, lte: compareEndDate },
        },
      }),
      prisma.project.findMany({
        where: {
          clerkId: userId,
          createdAt: { gte: compareStartDate, lte: compareEndDate },
        },
      }),
      prisma.expense.findMany({
        where: {
          clerkId: userId,
          date: { gte: compareStartDate, lte: compareEndDate },
        },
      }),
    ]);

    // Calculate current period metrics
    const currentRevenue = currentPayments
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const currentClientCount = currentClients.length;
    const currentProjectCount = currentProjects.length;
    const currentExpenseTotal = currentExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const currentProfit = currentRevenue - currentExpenseTotal;

    // Calculate previous period metrics
    const previousRevenue = previousPayments
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const previousClientCount = previousClients.length;
    const previousProjectCount = previousProjects.length;
    const previousExpenseTotal = previousExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const previousProfit = previousRevenue - previousExpenseTotal;

    // Calculate growth percentages
    const revenueGrowth = previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : 0;
    const clientGrowth = previousClientCount > 0
      ? ((currentClientCount - previousClientCount) / previousClientCount) * 100
      : 0;
    const projectGrowth = previousProjectCount > 0
      ? ((currentProjectCount - previousProjectCount) / previousProjectCount) * 100
      : 0;
    const profitGrowth = previousProfit !== 0
      ? ((currentProfit - previousProfit) / Math.abs(previousProfit)) * 100
      : 0;

    // Monthly trend data (last 12 months)
    const monthlyTrends: Record<string, {
      revenue: number;
      clients: number;
      projects: number;
      expenses: number;
    }> = {};

    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const key = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`;

      monthlyTrends[key] = {
        revenue: 0,
        clients: 0,
        projects: 0,
        expenses: 0,
      };
    }

    // Fill in monthly data
    currentPayments.forEach((payment) => {
      if (payment.status === 'COMPLETED') {
        const date = new Date(payment.date);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyTrends[key]) {
          monthlyTrends[key].revenue += Number(payment.amount);
        }
      }
    });

    currentClients.forEach((client) => {
      const date = new Date(client.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyTrends[key]) {
        monthlyTrends[key].clients += 1;
      }
    });

    currentProjects.forEach((project) => {
      const date = new Date(project.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyTrends[key]) {
        monthlyTrends[key].projects += 1;
      }
    });

    currentExpenses.forEach((expense) => {
      const date = new Date(expense.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyTrends[key]) {
        monthlyTrends[key].expenses += Number(expense.amount);
      }
    });

    return NextResponse.json({
      currentPeriod: {
        revenue: currentRevenue,
        clients: currentClientCount,
        projects: currentProjectCount,
        expenses: currentExpenseTotal,
        profit: currentProfit,
      },
      previousPeriod: {
        revenue: previousRevenue,
        clients: previousClientCount,
        projects: previousProjectCount,
        expenses: previousExpenseTotal,
        profit: previousProfit,
      },
      growth: {
        revenue: revenueGrowth,
        clients: clientGrowth,
        projects: projectGrowth,
        profit: profitGrowth,
      },
      monthlyTrends: Object.entries(monthlyTrends)
        .map(([period, data]) => ({
          period,
          revenue: data.revenue,
          clients: data.clients,
          projects: data.projects,
          expenses: data.expenses,
          profit: data.revenue - data.expenses,
        }))
        .sort((a, b) => a.period.localeCompare(b.period)),
      period,
      dateRange: {
        current: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
        previous: {
          start: compareStartDate.toISOString(),
          end: compareEndDate.toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching growth reports:', error);
    return NextResponse.json({ error: 'Failed to fetch growth reports' }, { status: 500 });
  }
}


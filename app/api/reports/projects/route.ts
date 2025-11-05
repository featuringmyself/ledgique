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

    // Get all projects
    const projects = await prisma.project.findMany({
      where: {
        clerkId: userId,
        createdAt: { gte: start, lte: end },
      },
      include: {
        client: {
          select: { name: true, company: true },
        },
        payments: {
          where: {
            date: { gte: start, lte: end },
          },
        },
        expenses: {
          where: {
            date: { gte: start, lte: end },
          },
        },
      },
    });

    // Calculate project metrics
    const projectMetrics = projects.map((project) => {
      const totalRevenue = project.payments
        .filter(p => p.status === 'COMPLETED')
        .reduce((sum, p) => sum + Number(p.amount), 0);
      
      const totalExpenses = project.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
      const budget = Number(project.budget || 0);
      const profit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
      const budgetUtilization = budget > 0 ? (totalExpenses / budget) * 100 : 0;

      return {
        id: project.id,
        name: project.name,
        client: project.client.name,
        status: project.status,
        priority: project.priority,
        budget,
        totalRevenue,
        totalExpenses,
        profit,
        profitMargin,
        budgetUtilization,
        paymentCount: project.payments.length,
        expenseCount: project.expenses.length,
        createdAt: project.createdAt,
        startDate: project.startDate,
        endDate: project.endDate,
      };
    });

    // Status breakdown
    const statusBreakdown = projectMetrics.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Priority breakdown
    const priorityBreakdown = projectMetrics.reduce((acc, project) => {
      acc[project.priority] = (acc[project.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Top projects by revenue
    const topProjectsByRevenue = [...projectMetrics]
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    // Top projects by profit
    const topProjectsByProfit = [...projectMetrics]
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 10);

    // Monthly project creation trend
    const creationTrend: Record<string, number> = {};
    projects.forEach((project) => {
      const date = new Date(project.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      creationTrend[key] = (creationTrend[key] || 0) + 1;
    });

    // Summary statistics
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS' || p.status === 'PENDING').length;
    const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;
    const totalBudget = projectMetrics.reduce((sum, p) => sum + p.budget, 0);
    const totalRevenue = projectMetrics.reduce((sum, p) => sum + p.totalRevenue, 0);
    const totalExpenses = projectMetrics.reduce((sum, p) => sum + p.totalExpenses, 0);
    const totalProfit = totalRevenue - totalExpenses;
    const averageProfitMargin = projectMetrics.length > 0
      ? projectMetrics.reduce((sum, p) => sum + p.profitMargin, 0) / projectMetrics.length
      : 0;

    return NextResponse.json({
      summary: {
        totalProjects,
        activeProjects,
        completedProjects,
        totalBudget,
        totalRevenue,
        totalExpenses,
        totalProfit,
        averageProfitMargin,
      },
      topProjectsByRevenue,
      topProjectsByProfit,
      projectMetrics,
      statusBreakdown: Object.entries(statusBreakdown).map(([status, count]) => ({
        status,
        count,
        percentage: totalProjects > 0 ? (count / totalProjects) * 100 : 0,
      })),
      priorityBreakdown: Object.entries(priorityBreakdown).map(([priority, count]) => ({
        priority,
        count,
        percentage: totalProjects > 0 ? (count / totalProjects) * 100 : 0,
      })),
      creationTrend: Object.entries(creationTrend)
        .map(([period, count]) => ({ period, count }))
        .sort((a, b) => a.period.localeCompare(b.period)),
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching project reports:', error);
    return NextResponse.json({ error: 'Failed to fetch project reports' }, { status: 500 });
  }
}


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
    const groupBy = searchParams.get('groupBy') || 'month';

    // Default to last 12 months if no dates provided
    const now = new Date();
    const defaultStartDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const defaultEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const start = startDate ? new Date(startDate) : defaultStartDate;
    const end = endDate ? new Date(endDate) : defaultEndDate;

    // Get all expenses
    const expenses = await prisma.expense.findMany({
      where: {
        clerkId: userId,
        date: { gte: start, lte: end },
      },
      include: {
        client: {
          select: { name: true },
        },
        project: {
          select: { name: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    // Calculate totals
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    // Category breakdown
    const categoryBreakdown = expenses.reduce((acc, expense) => {
      const category = expense.category;
      if (!acc[category]) {
        acc[category] = { count: 0, total: 0 };
      }
      acc[category].count++;
      acc[category].total += Number(expense.amount);
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    // Time series data
    const timeSeriesData: Record<string, { total: number; count: number }> = {};
    
    expenses.forEach((expense) => {
      let key: string;
      const date = new Date(expense.date);
      
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
        timeSeriesData[key] = { total: 0, count: 0 };
      }
      
      timeSeriesData[key].total += Number(expense.amount);
      timeSeriesData[key].count++;
    });

    // Expenses by project
    const expensesByProject = expenses
      .filter(e => e.projectId)
      .reduce((acc, expense) => {
        const projectId = expense.projectId!;
        const projectName = expense.project?.name || 'Unknown';
        if (!acc[projectId]) {
          acc[projectId] = { name: projectName, total: 0, count: 0 };
        }
        acc[projectId].total += Number(expense.amount);
        acc[projectId].count++;
        return acc;
      }, {} as Record<string, { name: string; total: number; count: number }>);

    // Expenses by client
    const expensesByClient = expenses
      .filter(e => e.clientId)
      .reduce((acc, expense) => {
        const clientId = expense.clientId!;
        const clientName = expense.client?.name || 'Unknown';
        if (!acc[clientId]) {
          acc[clientId] = { name: clientName, total: 0, count: 0 };
        }
        acc[clientId].total += Number(expense.amount);
        acc[clientId].count++;
        return acc;
      }, {} as Record<string, { name: string; total: number; count: number }>);

    // Top expenses
    const topExpenses = [...expenses]
      .sort((a, b) => Number(b.amount) - Number(a.amount))
      .slice(0, 10)
      .map(e => ({
        id: e.id,
        title: e.title,
        amount: Number(e.amount),
        category: e.category,
        date: e.date,
        project: e.project?.name,
        client: e.client?.name,
      }));

    // Average expense
    const averageExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;

    return NextResponse.json({
      summary: {
        totalExpenses,
        totalCount: expenses.length,
        averageExpense,
      },
      timeSeries: Object.entries(timeSeriesData)
        .map(([period, data]) => ({ period, ...data }))
        .sort((a, b) => a.period.localeCompare(b.period)),
      categoryBreakdown: Object.entries(categoryBreakdown).map(([category, data]) => ({
        category,
        count: data.count,
        total: data.total,
        percentage: totalExpenses > 0 ? (data.total / totalExpenses) * 100 : 0,
      })),
      expensesByProject: Object.entries(expensesByProject)
        .map(([projectId, data]) => ({ projectId, ...data }))
        .sort((a, b) => b.total - a.total),
      expensesByClient: Object.entries(expensesByClient)
        .map(([clientId, data]) => ({ clientId, ...data }))
        .sort((a, b) => b.total - a.total),
      topExpenses,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching expense reports:', error);
    return NextResponse.json({ error: 'Failed to fetch expense reports' }, { status: 500 });
  }
}


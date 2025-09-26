import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Get current and previous pending amounts (project budget - completed payments)
    const [currentProjects, previousProjects] = await Promise.all([
      prisma.project.findMany({
        where: {
          clerkId: userId,
          budget: { not: null },
        },
        select: {
          budget: true,
          payments: {
            where: { status: 'COMPLETED' },
            select: { amount: true },
          },
        },
      }),
      prisma.project.findMany({
        where: {
          clerkId: userId,
          budget: { not: null },
          createdAt: { lte: thirtyDaysAgo },
        },
        select: {
          budget: true,
          payments: {
            where: { 
              status: 'COMPLETED',
              date: { lte: thirtyDaysAgo }
            },
            select: { amount: true },
          },
        },
      })
    ]);
    
    const calculatePending = (projects: { budget: Decimal | null; payments: { amount: Decimal }[] }[]) => {
      return projects.reduce((total, project) => {
        const budget = Number(project.budget || 0);
        const paid = project.payments.reduce((sum: number, p) => sum + Number(p.amount), 0);
        return total + Math.max(0, budget - paid);
      }, 0);
    };
    
    const current = calculatePending(currentProjects);
    const previous = calculatePending(previousProjects);
    
    if (previous === 0) {
      return NextResponse.json(current > 0 ? "+100%" : "0.00%");
    }
    
    const change = ((current - previous) / previous) * 100;
    const sign = change >= 0 ? "+" : "";
    
    return NextResponse.json(`${sign}${change.toFixed(1)}%`);
  } catch (error) {
    console.error('Error fetching pending payments change:', error);
    return NextResponse.json("0.00%", { status: 200 });
  }
}
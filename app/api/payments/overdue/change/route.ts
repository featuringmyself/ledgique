import { NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const [currentOverdue, previousOverdue] = await Promise.all([
      prisma.payment.aggregate({
        where: {
          dueDate: { lt: now },
          status: { in: ['PENDING', 'PARTIALLY_PAID'] },
          project: { clerkId: userId },
        },
        _sum: { amount: true }
      }),
      prisma.payment.aggregate({
        where: {
          dueDate: { lt: thirtyDaysAgo },
          status: { in: ['PENDING', 'PARTIALLY_PAID'] },
          project: { clerkId: userId },
        },
        _sum: { amount: true }
      })
    ]);
    
    const current = Number(currentOverdue._sum.amount || 0);
    const previous = Number(previousOverdue._sum.amount || 0);
    
    if (previous === 0) {
      return NextResponse.json(current > 0 ? "+100%" : "0.00%");
    }
    
    const change = ((current - previous) / previous) * 100;
    const sign = change >= 0 ? "+" : "";
    
    return NextResponse.json(`${sign}${change.toFixed(1)}%`);
  } catch (error) {
    console.error('Error calculating overdue change:', error);
    return NextResponse.json("0.00%");
  }
}
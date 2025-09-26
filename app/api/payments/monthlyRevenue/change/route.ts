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
    
    // Current month
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Previous month
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const [currentMonth, prevMonth] = await Promise.all([
      prisma.payment.aggregate({
        where: {
          date: { gte: currentMonthStart, lte: currentMonthEnd },
          status: 'COMPLETED',
          project: { clerkId: userId },
        },
        _sum: { amount: true }
      }),
      prisma.payment.aggregate({
        where: {
          date: { gte: prevMonthStart, lte: prevMonthEnd },
          status: 'COMPLETED',
          project: { clerkId: userId },
        },
        _sum: { amount: true }
      })
    ]);
    
    const current = Number(currentMonth._sum.amount || 0);
    const previous = Number(prevMonth._sum.amount || 0);
    
    if (previous === 0) {
      return NextResponse.json(current > 0 ? "+100%" : "0.00%");
    }
    
    const change = ((current - previous) / previous) * 100;
    const sign = change >= 0 ? "+" : "";
    
    return NextResponse.json(`${sign}${change.toFixed(1)}%`);
  } catch (error) {
    console.error('Error calculating monthly revenue change:', error);
    return NextResponse.json("0.00%");
  }
}
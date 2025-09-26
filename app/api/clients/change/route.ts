import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    
    // Current month
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Previous month
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const [currentCount, prevCount] = await Promise.all([
      prisma.client.count({
        where: {
          clerkId: userId,
          createdAt: { gte: currentMonthStart },
        },
      }),
      prisma.client.count({
        where: {
          clerkId: userId,
          createdAt: { gte: prevMonthStart, lte: prevMonthEnd },
        },
      })
    ]);
    
    if (prevCount === 0) {
      return NextResponse.json(currentCount > 0 ? "+100%" : "0.00%");
    }
    
    const change = ((currentCount - prevCount) / prevCount) * 100;
    const sign = change >= 0 ? "+" : "";
    
    return NextResponse.json(`${sign}${change.toFixed(1)}%`);
  } catch (error) {
    console.error('Error fetching client change:', error);
    return NextResponse.json("0.00%", { status: 200 });
  }
}
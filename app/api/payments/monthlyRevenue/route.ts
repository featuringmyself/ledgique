import { NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
    
    const monthlyRevenue = await prisma.payment.aggregate({
      where: {
        date: { gte: startOfMonth, lte: endOfMonth },
        status: 'COMPLETED',
        project: {
          clerkId: userId,
        },
      },
      _sum: { amount: true }
    });
    
    return NextResponse.json(monthlyRevenue._sum.amount || 0);
  } catch (error) {
    console.error('Error fetching monthly revenue:', error);
    return NextResponse.json(
      { error: 'Failed to fetch monthly revenue' },
      { status: 500 }
    );
  }
}

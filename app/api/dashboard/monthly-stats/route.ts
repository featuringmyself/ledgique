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

    // Get last 12 months of data
    const months = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const [clientCount, projectCount] = await Promise.all([
        prisma.client.count({
          where: {
            clerkId: userId,
            createdAt: { gte: startDate, lte: endDate },
            status: 'ACTIVE'
          }
        }),
        prisma.project.count({
          where: {
            clerkId: userId,
            createdAt: { gte: startDate, lte: endDate },
            status: { in: ['IN_PROGRESS', 'COMPLETED'] }
          }
        })
      ]);

      months.push({
        month: startDate.toLocaleDateString('en-US', { month: 'short' }),
        clients: clientCount,
        projects: projectCount
      });
    }

    return NextResponse.json(months);
  } catch (error) {
    console.error('Error fetching monthly stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch monthly stats' },
      { status: 500 }
    );
  }
}
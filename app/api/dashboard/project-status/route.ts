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

    const statusCounts = await prisma.project.groupBy({
      by: ['status'],
      where: {
        clerkId: userId,
      },
      _count: {
        status: true,
      },
    });

    const colors = {
      'PENDING': '#f59e0b',
      'IN_PROGRESS': '#3b82f6',
      'COMPLETED': '#10b981',
      'CANCELLED': '#ef4444',
      'ON_HOLD': '#8b5cf6'
    };

    const data = statusCounts.map(item => ({
      name: item.status.replace('_', ' '),
      value: item._count.status,
      color: colors[item.status as keyof typeof colors] || '#6b7280'
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching project status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project status' },
      { status: 500 }
    );
  }
}
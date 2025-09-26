import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all projects with their budgets and completed payments
    const projects = await prisma.project.findMany({
      where: {
        clerkId: userId,
        budget: { not: null },
      },
      select: {
        id: true,
        budget: true,
        payments: {
          where: {
            status: 'COMPLETED',
          },
          select: {
            amount: true,
          },
        },
      },
    });

    let totalPendingAmount = 0;

    projects.forEach(project => {
      const budget = Number(project.budget || 0);
      const paymentsReceived = project.payments.reduce(
        (sum, payment) => sum + Number(payment.amount), 
        0
      );
      const pendingForProject = Math.max(0, budget - paymentsReceived);
      totalPendingAmount += pendingForProject;
    });
    
    return NextResponse.json({ totalPendingAmount });
    
  } catch (error) {
    console.error('Error fetching pending payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending payments' },
      { status: 500 }
    );
  }
}
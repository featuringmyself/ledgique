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

    const result = await prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: 'PENDING',
        project: {
          clerkId: userId,
        },
      },
    });
    
    return NextResponse.json({ totalPendingAmount: result._sum.amount ?? 0 });
    
    
  } catch (error) {
    console.error('Error fetching pending payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending payments' },
      { status: 500 }
    );
  }
}
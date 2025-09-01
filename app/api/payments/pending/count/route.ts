import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const result = await prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: 'PENDING',
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
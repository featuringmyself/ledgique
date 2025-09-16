import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payments = await prisma.payment.findMany({
      where: { 
        project: { clerkId: userId }
      },
      include: {
        client: { select: { name: true, company: true } },
        project: { select: { name: true } }
      },
      orderBy: { date: 'desc' }
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      amount, 
      description, 
      type, 
      method, 
      status, 
      date, 
      dueDate, 
      projectId, 
      clientId 
    } = await request.json();

    const payment = await prisma.payment.create({
      data: {
        amount,
        description,
        type,
        method,
        status,
        date: new Date(date),
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        clientId
      },
      include: {
        client: { select: { name: true, company: true } },
        project: { select: { name: true } }
      }
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}
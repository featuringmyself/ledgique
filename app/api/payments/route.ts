import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [payments, totalCount] = await Promise.all([
      prisma.payment.findMany({
        where: { 
          project: { clerkId: userId }
        },
        include: {
          client: { select: { name: true, company: true } },
          project: { select: { name: true } }
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.payment.count({
        where: { 
          project: { clerkId: userId }
        }
      })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      payments,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
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
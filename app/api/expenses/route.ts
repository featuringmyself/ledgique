import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const expenses = await prisma.expense.findMany({
      where: { clerkId: userId },
      include: { project: { select: { name: true } } },
      orderBy: { date: 'desc' }
    });

    return NextResponse.json(expenses);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, amount, category, date, receiptUrl, projectId } = await request.json();

    const expense = await prisma.expense.create({
      data: {
        title,
        description,
        amount,
        category,
        date: new Date(date),
        receiptUrl,
        projectId,
        clerkId: userId
      },
      include: { project: { select: { name: true } } }
    });

    return NextResponse.json(expense);
  } catch {
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}
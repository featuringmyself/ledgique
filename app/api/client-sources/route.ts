import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientSources = await prisma.clientSource.findMany({
      where: { clerkId: userId },
      include: {
        _count: {
          select: { clients: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(clientSources);
  } catch (error) {
    console.error('Error fetching client sources:', error);
    return NextResponse.json({ error: 'Failed to fetch client sources' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await request.json();

    const clientSource = await prisma.clientSource.create({
      data: {
        name,
        clerkId: userId
      }
    });

    return NextResponse.json(clientSource);
  } catch (error) {
    console.error('Error creating client source:', error);
    return NextResponse.json({ error: 'Failed to create client source' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const projectId = searchParams.get('projectId');

    const where: Prisma.NoteWhereInput = {
      clerkId: userId,
      status: 'ACTIVE',
    };

    if (clientId) {
      where.clientId = clientId;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    const notes = await prisma.note.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error fetching active notes:', error);
    return NextResponse.json({ error: 'Failed to fetch active notes' }, { status: 500 });
  }
}

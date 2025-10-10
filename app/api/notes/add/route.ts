import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      title,
      content,
      type,
      priority,
      status,
      tags,
      dueDate,
      clientId,
      projectId,
    } = await request.json();

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Validate client/project relationship if both are provided
    if (clientId && projectId) {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          clientId: clientId,
          clerkId: userId,
        },
      });

      if (!project) {
        return NextResponse.json(
          { error: 'Project does not belong to the specified client' },
          { status: 400 }
        );
      }
    }

    const note = await prisma.note.create({
      data: {
        title,
        content,
        type: type || 'GENERAL',
        priority: priority || 'MEDIUM',
        status: status || 'ACTIVE',
        tags: tags || [],
        dueDate: dueDate ? new Date(dueDate) : null,
        clerkId: userId,
        clientId: clientId || null,
        projectId: projectId || null,
      },
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
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}

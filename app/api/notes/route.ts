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
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const clientId = searchParams.get('clientId');
    const projectId = searchParams.get('projectId');
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {
      clerkId: userId,
    };

    if (type && type !== 'ALL') {
      where.type = type;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (priority && priority !== 'ALL') {
      where.priority = priority;
    }

    if (clientId && clientId !== 'ALL') {
      where.clientId = clientId;
    }

    if (projectId && projectId !== 'ALL') {
      where.projectId = projectId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    const [notes, totalCount] = await Promise.all([
      prisma.note.findMany({
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
        skip,
        take: limit,
      }),
      prisma.note.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      notes,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

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

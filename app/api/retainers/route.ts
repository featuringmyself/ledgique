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

    const [retainers, totalCount] = await Promise.all([
      prisma.retainer.findMany({
        where: { 
          client: { clerkId: userId }
        },
        include: {
          client: { select: { name: true, company: true } },
          project: { select: { name: true } }
        },
        orderBy: { startDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.retainer.count({
        where: { 
          client: { clerkId: userId }
        }
      })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      retainers,
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
    console.error('Error fetching retainers:', error);
    return NextResponse.json({ error: 'Failed to fetch retainers' }, { status: 500 });
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
      description,
      totalAmount,
      hourlyRate,
      clientId,
      projectId,
      startDate,
      endDate
    } = await request.json();

    const totalAmountDecimal = parseFloat(totalAmount);
    const hourlyRateDecimal = hourlyRate ? parseFloat(hourlyRate) : null;

    const retainer = await prisma.retainer.create({
      data: {
        title,
        description,
        totalAmount: totalAmountDecimal,
        hourlyRate: hourlyRateDecimal,
        clientId,
        projectId: projectId || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null
      },
      include: {
        client: { select: { name: true, company: true } },
        project: { select: { name: true } }
      }
    });

    return NextResponse.json(retainer);
  } catch (error) {
    console.error('Error creating retainer:', error);
    return NextResponse.json({ error: 'Failed to create retainer' }, { status: 500 });
  }
}
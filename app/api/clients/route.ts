import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const clientSourceId = searchParams.get('clientSourceId');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause
    const where: any = {
      clerkId: userId,
    };

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (clientSourceId && clientSourceId !== 'ALL') {
      where.clientSourceId = clientSourceId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
      // For array fields, we'll search if any element contains the search term
      // Note: Prisma doesn't support partial matching in arrays directly,
      // so we search for exact matches in email/phone arrays
      const emailMatch = { email: { has: search } };
      const phoneMatch = { phone: { has: search } };
      where.OR.push(emailMatch, phoneMatch);
    }

    // Build orderBy clause
    const orderBy: any = {};
    if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else if (sortBy === 'status') {
      orderBy.status = sortOrder;
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder;
    } else {
      orderBy.createdAt = 'desc';
    }

    const [clients, totalCount] = await Promise.all([
      prisma.client.findMany({
        where,
        include: {
          clientSource: {
            select: {
              id: true,
              name: true
            }
          },
          projects: {
            select: {
              id: true,
              name: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
          _count: {
            select: {
              projects: true,
              payments: true
            }
          }
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.client.count({
        where
      })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      clients,
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
    console.error('Error fetching clients:', error);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { 
      name, 
      email, 
      phone, 
      company, 
      address, 
      website, 
      notes, 
      clientSourceId 
    } = await request.json();

    const client = await prisma.client.create({
      data: {
        name,
        email: email ? [email] : [],
        phone: phone ? [phone] : [],
        company,
        address,
        website,
        notes,
        clientSourceId,
        clerkId: userId
      },
      include: {
        clientSource: {
          select: {
            name: true
          }
        }
      }
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}

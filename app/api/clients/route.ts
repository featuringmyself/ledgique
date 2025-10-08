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

    const [clients, totalCount] = await Promise.all([
      prisma.client.findMany({
        where: {
          clerkId: userId,
        },
        include: {
          clientSource: {
            select: {
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
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
      }),
      prisma.client.count({
        where: {
          clerkId: userId,
        }
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

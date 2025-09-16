import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clients = await prisma.client.findMany({
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
        }
    });

    return NextResponse.json(clients);
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

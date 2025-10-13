import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clients = await prisma.client.findMany({
      where: {
        clerkId: userId,
      },
      select: {
        id: true,
        name: true,
        company: true,
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error('Error fetching clients for autocomplete:', error);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}

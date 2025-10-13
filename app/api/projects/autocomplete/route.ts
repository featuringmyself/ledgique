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
    const clientId = searchParams.get('clientId');

    const projects = await prisma.project.findMany({
      where: {
        clerkId: userId,
        ...(clientId && { clientId })
      },
      select: {
        id: true,
        name: true,
        clientId: true,
        client: {
          select: {
            name: true,
            company: true,
          },
        },
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects for autocomplete:', error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

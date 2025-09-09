import { NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sources = await prisma.clientSource.findMany({
      where: { clerkId: userId },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(sources);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch client sources' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await request.json();

    const source = await prisma.clientSource.create({
      data: { name, clerkId: userId }
    });

    return NextResponse.json(source);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create client source' }, { status: 500 });
  }
}
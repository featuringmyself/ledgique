import { auth } from '@clerk/nextjs/server';
import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payment = await prisma.payment.findMany({
      where: {
        project: {
          clerkId: userId,
        },
      },
      select: {
        id: true,
        date: true,
        amount: true,
        method: true,
        status: true,
        client: {
          select: {
            name: true,
            email: true,
            phone: true,
            id: true,
          },
        },
        project: {
          select: {
            name: true,
            id: true,
          },
        },
      },
      orderBy: { date: "desc" },
      take: req.nextUrl.searchParams.get("take") 
        ? parseInt(req.nextUrl.searchParams.get("take") as string) 
        : 10,
    });
    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}
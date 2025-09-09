import { NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payments = await prisma.payment.findMany({
      where: {
        project: {
          clerkId: userId,
        },
      },
      select: { method: true }
    });

    const total = payments.length;
    const methodCounts = payments.reduce((acc, payment) => {
      acc[payment.method] = (acc[payment.method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const methodPercentages = Object.entries(methodCounts).map(([method, count]) => ({
      method,
      count,
      percentage: ((count / total) * 100).toFixed(1)
    }));

    return NextResponse.json(methodPercentages);
  } catch {
    return NextResponse.json({ error: "Failed to fetch payment methods" }, { status: 500 });
  }
}
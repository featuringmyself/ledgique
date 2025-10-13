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

    // Get overdue payments (past due date and not completed)
    const overduePayments = await prisma.payment.aggregate({
      where: {
        dueDate: { lt: new Date() },
        status: { in: ["PENDING", "PARTIALLY_PAID", "FAILED"] },
        project: {
          clerkId: userId,
        },
      },
      _sum: {
        amount: true,
      },
    });

    return NextResponse.json(overduePayments._sum.amount || 0);
  } catch (error) {
    console.error("Error fetching overdue amount:", error);
    return NextResponse.json(
      { error: "Failed to fetch overdue amount" },
      { status: 500 }
    );
  }
}

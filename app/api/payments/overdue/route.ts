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

    // Get overdue invoices (past due date and not paid)
    const overdueInvoices = await prisma.invoice.aggregate({
      where: {
        dueDate: { lt: new Date() },
        status: { in: ["SENT", "VIEWED", "OVERDUE"] },
        client: {
          clerkId: userId,
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    return NextResponse.json(overdueInvoices._sum.totalAmount || 0);
  } catch (error) {
    console.error("Error fetching overdue amount:", error);
    return NextResponse.json(
      { error: "Failed to fetch overdue amount" },
      { status: 500 }
    );
  }
}

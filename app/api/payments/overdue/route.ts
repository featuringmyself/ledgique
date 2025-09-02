import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const overdueAmount = await prisma.payment.aggregate({
      where: {
        dueDate: { lt: new Date() },
        status: { in: ["PENDING", "PARTIALLY_PAID"] },
      },
      _sum: {
        amount: true,
      },
    });

    return NextResponse.json(overdueAmount._sum.amount || 0);
  } catch (error) {
    console.error("Error fetching pending payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending payments" },
      { status: 500 }
    );
  }
}

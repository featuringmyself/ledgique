import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const payment = await prisma.payment.findMany({
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
}     
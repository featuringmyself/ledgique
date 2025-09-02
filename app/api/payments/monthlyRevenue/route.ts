
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() +1, 0);
  try {
    const monthlyRevenue = await prisma.payment.aggregate({
        where: {
            date: {gte: startOfMonth, lte: endOfMonth},
            status: 'COMPLETED'
        },
        _sum: {amount: true}
    })
    return NextResponse.json(monthlyRevenue._sum.amount || 0)
  } 
  catch (error) {
    console.log(error)
    }
}

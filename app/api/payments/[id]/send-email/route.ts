import { NextRequest, NextResponse } from "next/server";
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        client: true,
        project: true,
      },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Simulate email sending
    console.log(`Sending email to ${payment.client.email} for payment ${payment.id}`);
    
    return NextResponse.json({ message: "Email sent successfully" });
  } catch {
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
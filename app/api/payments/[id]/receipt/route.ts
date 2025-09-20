import { NextRequest, NextResponse } from "next/server";
import prisma from '@/lib/prisma';

export async function GET(
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

    const receiptContent = `PAYMENT RECEIPT\n===============\n\nReceipt ID: ${payment.id}\nDate: ${new Date(payment.date).toLocaleDateString()}\n\nClient: ${payment.client.name}\nProject: ${payment.project.name}\nAmount: ₹${payment.amount.toLocaleString()}\nMethod: ${payment.method.replace('_', ' ')}\nStatus: ${payment.status}\n\nThank you for your payment!`;

    return new NextResponse(receiptContent, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="receipt-${payment.id}.txt"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate receipt" }, { status: 500 });
  }
}
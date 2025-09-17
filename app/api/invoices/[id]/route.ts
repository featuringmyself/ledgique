import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status, paymentData } = await request.json();
    const invoiceId = params.id;

    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status },
      include: {
        client: { select: { name: true, company: true } },
        project: { select: { name: true } },
        items: true,
        payments: true
      }
    });

    if (status === 'PAID' && paymentData) {
      await prisma.payment.create({
        data: {
          amount: paymentData.amount,
          description: `Payment for invoice ${updatedInvoice.invoiceNumber}`,
          type: 'FULL_PAYMENT',
          method: paymentData.method || 'BANK_TRANSFER',
          status: 'COMPLETED',
          date: new Date(paymentData.date || new Date()),
          projectId: updatedInvoice.projectId!,
          clientId: updatedInvoice.clientId,
          invoiceId: invoiceId
        }
      });
    }

    return NextResponse.json(updatedInvoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}
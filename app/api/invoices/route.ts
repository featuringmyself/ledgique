import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invoices = await prisma.invoice.findMany({
      where: { 
        client: { clerkId: userId }
      },
      include: {
        client: { select: { name: true, company: true } },
        project: { select: { name: true } },
        items: true,
        payments: true
      },
      orderBy: { issueDate: 'desc' }
    });

    return NextResponse.json(invoices);
  } catch (error: unknown) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      title,
      description,
      clientId,
      projectId,
      dueDate,
      items,
      taxRate,
      discountAmount,
      notes,
      terms
    } = await request.json();

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: { quantity: number; unitPrice: number }) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = subtotal * (taxRate || 0) / 100;
    const totalAmount = subtotal + taxAmount - (discountAmount || 0);

    // Generate invoice number
    const invoiceCount = await prisma.invoice.count();
    const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(4, '0')}`;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        title,
        description,
        clientId,
        projectId,
        dueDate: new Date(dueDate),
        subtotal,
        taxRate: taxRate || 0,
        taxAmount,
        discountAmount: discountAmount || 0,
        totalAmount,
        notes,
        terms,
        items: {
          create: items.map((item: { description: string; quantity: number; unitPrice: number }) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice
          }))
        }
      },
      include: {
        client: { select: { name: true, company: true } },
        project: { select: { name: true } },
        items: true
      }
    });

    return NextResponse.json(invoice);
  } catch (error: unknown) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}
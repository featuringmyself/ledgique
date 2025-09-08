import { NextResponse } from 'next/server';
import prisma  from "@/lib/prisma";

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        items: true,
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            date: true,
          },
        },
        _count: {
          select: {
            items: true,
            payments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      clientId,
      projectId,
      dueDate,
      items,
      notes,
      terms,
      taxRate = 0,
      discountAmount = 0,
    } = body;

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount - (discountAmount || 0);

    // Generate invoice number
    const lastInvoice = await prisma.invoice.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { invoiceNumber: true },
    });

    const currentYear = new Date().getFullYear();
    let invoiceNumber = `INV-${currentYear}-001`;
    
    if (lastInvoice?.invoiceNumber) {
      const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
      const nextNumber = (lastNumber + 1).toString().padStart(3, '0');
      invoiceNumber = `INV-${currentYear}-${nextNumber}`;
    }

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        title,
        description,
        clientId,
        projectId,
        dueDate: new Date(dueDate),
        subtotal,
        taxRate: taxRate / 100,
        taxAmount,
        discountAmount: discountAmount || 0,
        totalAmount,
        notes,
        terms,
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        client: true,
        project: true,
        items: true,
      },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
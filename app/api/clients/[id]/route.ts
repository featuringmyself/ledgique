import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';


export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        clientSource: true,
        projects: {
          select: {
            id: true,
            name: true,
            status: true,
            budget: true,
            startDate: true,
            endDate: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        },
        invoices: {
          include: {
            project: { select: { name: true } },
            items: true,
            payments: {
              select: {
                id: true,
                amount: true,
                date: true,
                status: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        payments: {
          include: {
            project: { select: { name: true } },
            invoice: { select: { invoiceNumber: true, title: true } }
          },
          orderBy: { date: 'desc' }
        },
        notes: {
          orderBy: { createdAt: 'desc' }
        },
        expenses: {
          include: {
            project: { select: { name: true } }
          },
          orderBy: { date: 'desc' }
        },
        retainers: {
          include: {
            project: { select: { name: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            projects: true,
            payments: true,
            invoices: true,
            notes: true,
            expenses: true,
            retainers: true
          }
        }
      }
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json({ error: 'Failed to fetch client' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, phone, company, address, website, notes, clientSourceId } = body;

    const client = await prisma.client.update({
      where: { id },
      data: {
        name,
        email: email ? [email] : [],
        phone: phone ? [phone] : [],
        company: company || null,
        address: address || null,
        website: website || null,
        notes: notes || null,
        clientSourceId: clientSourceId || null,
      }
    });

    return NextResponse.json(client);
  } catch {
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.client.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Client deleted successfully' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
  }
}
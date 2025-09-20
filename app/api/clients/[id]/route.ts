import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';


export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        clientSource: true,
        projects: { select: { name: true } },
        _count: { select: { projects: true, payments: true } }
      }
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();  
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      email,
      phone,
      company,
      address,
      website,
      notes,
    } = body;



    // Create the client
    const client = await prisma.client.create({
      data: {
        name,
        email: email ? [email] : [],
        phone: phone ? [phone] : [],
        company,
        address,
        website,
        notes,
        clerkId: userId,
      },

    });

    return NextResponse.json(client);
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}
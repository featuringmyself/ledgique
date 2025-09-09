import { NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const [recentPayments, recentProjects, recentClients] = await Promise.all([
      prisma.payment.findMany({
        where: {
          project: { clerkId: userId }
        },
        select: {
          id: true,
          amount: true,
          date: true,
          status: true,
          client: { select: { name: true } },
          project: { select: { name: true } }
        },
        orderBy: { date: 'desc' },
        take: 3
      }),
      prisma.project.findMany({
        where: { clerkId: userId },
        select: {
          id: true,
          name: true,
          status: true,
          createdAt: true,
          client: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 3
      }),
      prisma.client.findMany({
        where: { clerkId: userId },
        select: {
          id: true,
          name: true,
          company: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 3
      })
    ]);

    const activity = [
      ...recentPayments.map(p => ({
        type: 'payment',
        title: `Payment received from ${p.client.name}`,
        amount: p.amount,
        date: p.date,
        status: p.status
      })),
      ...recentProjects.map(p => ({
        type: 'project',
        title: `New project: ${p.name}`,
        client: p.client.name,
        date: p.createdAt,
        status: p.status
      })),
      ...recentClients.map(c => ({
        type: 'client',
        title: `New client: ${c.name}`,
        company: c.company,
        date: c.createdAt
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

    return NextResponse.json(activity);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent activity' },
      { status: 500 }
    );
  }
}
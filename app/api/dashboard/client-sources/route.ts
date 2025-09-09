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

    const clients = await prisma.client.findMany({
      where: {
        clerkId: userId,
        status: 'ACTIVE'
      },
      select: {
        clientSource: {
          select: {
            name: true
          }
        }
      }
    });

    // Count clients by source
    const sourceCounts = clients.reduce((acc, client) => {
      const source = client.clientSource?.name || 'Unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalClients = clients.length;
    
    // Convert to percentage format
    const sourceData = Object.entries(sourceCounts)
      .map(([name, count]) => ({
        name,
        percentage: totalClients > 0 ? Math.round((count / totalClients) * 100) : 0
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 7); // Show top 7 sources

    // If no data, return empty array
    if (sourceData.length === 0) {
      return NextResponse.json([{ name: 'No sources', percentage: 0 }]);
    }

    return NextResponse.json(sourceData);
  } catch (error) {
    console.error('Error fetching client sources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client sources' },
      { status: 500 }
    );
  }
}
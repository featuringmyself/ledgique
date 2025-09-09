import { auth } from '@clerk/nextjs/server';
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const clients = await prisma.client.findMany({
      where: {
        clerkId: userId,
      },
      select: {
        id: true,
        name: true,
        company: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return new Response(JSON.stringify(clients), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Failed to fetch clients" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
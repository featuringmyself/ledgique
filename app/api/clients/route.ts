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

    // Find the user by clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const client = await prisma.client.findMany({
        where: {
            userId: user.id,
        },
        select: {
            id: true,
            name: true,
            address: true,
            projects: {
                select: {
                    id: true,
                    name: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: 1,
            },
            createdAt: true,
            status: true
        },
    });

    return new Response(JSON.stringify(client), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch users" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

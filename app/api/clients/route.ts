import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const client = await prisma.client.findMany({
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
            updatedAt: true,
            status: true
        }
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

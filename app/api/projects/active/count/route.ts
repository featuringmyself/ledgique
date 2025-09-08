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

        const count = await prisma.project.count({
            where: {
                status: 'IN_PROGRESS',
                clerkId: userId,
            }
        });

        return new Response(JSON.stringify(count), { status: 200 });
    } catch (error) {
        console.error('Failed to count projects:', error);
        return new Response(JSON.stringify({ error: "Failed to count projects" }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
}
import { auth } from '@clerk/nextjs/server';
import prisma from "@/lib/prisma";

export async function GET(){
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

        const projects = await prisma.project.findMany({
            where: {
                clerkId: userId,
            },
            include: {
                client: {
                    select: {
                        name: true,
                        company: true,
                    },
                },
            },
        });
        
        return new Response(JSON.stringify(projects), { status: 200 });
    } catch (error) {
        console.log(error);
        return new Response(JSON.stringify({ error: "Failed to fetch projects" }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
}
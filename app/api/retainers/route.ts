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

        const retainers = await prisma.retainer.findMany({
            where: {
                client: {
                    clerkId: userId,
                },
            },
            include: {
                client: {
                    select: {
                        name: true,
                        company: true,
                    },
                },
                project: {
                    select: {
                        name: true,
                    },
                },
            },
        });
        
        return new Response(JSON.stringify(retainers), { status: 200 });
    } catch (error) {
        console.log(error);
        return new Response(JSON.stringify({ error: "Failed to fetch retainers" }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
}

export async function POST(request: Request) {
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

        const body = await request.json();
        const { title, description, clientId, projectId, totalAmount, hourlyRate, endDate } = body;

        if (!title || !clientId || !totalAmount) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), {
                status: 400,
                headers: {
                    "Content-Type": "application/json",
                },
            });
        }

        const retainer = await prisma.retainer.create({
            data: {
                title,
                description,
                clientId,
                projectId: projectId || null,
                totalAmount: parseFloat(totalAmount),
                remainingAmount: parseFloat(totalAmount),
                hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
                endDate: endDate ? new Date(endDate) : null,
            },
        });

        return new Response(JSON.stringify(retainer), { status: 201 });
    } catch (error) {
        console.log(error);
        return new Response(JSON.stringify({ error: "Failed to create retainer" }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
}
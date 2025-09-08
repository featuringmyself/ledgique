import { auth } from '@clerk/nextjs/server';
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        const result = await prisma.payment.aggregate({
            where: {
                status: "COMPLETED",
                project: {
                    clerkId: userId,
                },
            },
            _sum: {
                amount: true
            }
        });
        
        const revenue = Number(result._sum.amount || 0);
        return new Response(JSON.stringify(revenue), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error fetching revenue:', error);
        return new Response(JSON.stringify({ error: "Failed to fetch revenue" }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}
import prisma from "@/lib/prisma";



export async function GET() {
    try {
        const result = await prisma.payment.aggregate({
            where: {
                status: "COMPLETED"
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
        console.log(error);
    }

}
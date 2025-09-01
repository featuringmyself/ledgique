import prisma from "@/lib/prisma";

export async function GET() {
    try {
        //for prod => showing projects of the specific user
        const projects = await prisma.client.count({
            where: {
                status: 'ACTIVE'
            }
        })
        console.log(projects);

        return new Response(JSON.stringify(projects), { status: 200 });
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
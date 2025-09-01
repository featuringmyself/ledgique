import prisma from "@/lib/prisma";


export async function GET(){
    try {
        //for prod => showing clients of the specific user
        const projects = await prisma.project.findMany({})
        console.log(projects);
        
        return new Response(JSON.stringify(projects), { status: 200 });
    } catch (error) {
        console.log(error)
    }
}
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest){
    try {
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        const [projects, totalCount] = await Promise.all([
            prisma.project.findMany({
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
                    _count: {
                        select: {
                            tasks: true,
                            payments: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limit,
            }),
            prisma.project.count({
                where: {
                    clerkId: userId,
                }
            })
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json({
            projects,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { 
            name, 
            description, 
            clientId, 
            deliverables, 
            status, 
            priority, 
            startDate, 
            endDate, 
            budget, 
            tags 
        } = await request.json();

        const project = await prisma.project.create({
            data: {
                name,
                description,
                clientId,
                clerkId: userId,
                deliverables: deliverables || [],
                status: status || 'PENDING',
                priority: priority || 'MEDIUM',
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                budget: budget ? parseFloat(budget) : null,
                tags: tags || []
            },
            include: {
                client: {
                    select: {
                        name: true,
                        company: true,
                    },
                }
            }
        });
        
        return NextResponse.json(project);
    } catch (error) {
        console.error('Error creating project:', error);
        return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
    }
}
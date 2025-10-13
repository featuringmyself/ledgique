import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        // Find projects that are marked as COMPLETED but have incomplete payments
        const [projects, totalCount] = await Promise.all([
            prisma.project.findMany({
                where: {
                    clerkId: userId,
                    status: 'COMPLETED',
                    payments: {
                        some: {
                            status: {
                                not: 'COMPLETED' // Still filter projects with pending payments
                            }
                        }
                    }
                },
                include: {
                    client: {
                        select: {
                            name: true,
                            company: true,
                        },
                    },
                    payments: {
                        // Remove the where clause to get ALL payments
                        select: {
                            id: true,
                            amount: true,
                            status: true,
                            date: true,
                            dueDate: true,
                            description: true,
                            type: true,
                            method: true
                        },
                        orderBy: {
                            dueDate: 'asc'
                        }
                    },
                    _count: {
                        select: {
                            payments: true
                        }
                    }
                },
                orderBy: {
                    updatedAt: 'desc'
                },
                skip,
                take: limit,
            }),
            prisma.project.count({
                where: {
                    clerkId: userId,
                    status: 'COMPLETED',
                    payments: {
                        some: {
                            status: {
                                not: 'COMPLETED'
                            }
                        }
                    }
                }
            })
        ]);

        // Calculate payment summary for each project
        const projectsWithPaymentSummary = projects.map(project => {
            const totalBudget = project.budget ? Number(project.budget) : 0;
            const completedPayments = project.payments.filter(p => p.status === 'COMPLETED');
            const pendingPayments = project.payments.filter(p => p.status !== 'COMPLETED');
            
            const totalPaid = completedPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
            const totalPending = pendingPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
            const paymentCompletionPercentage = totalBudget > 0 ? (totalPaid / totalBudget) * 100 : 0;

            return {
                ...project,
                paymentSummary: {
                    totalBudget,
                    totalPaid,
                    totalPending,
                    paymentCompletionPercentage: Math.round(paymentCompletionPercentage),
                    completedPaymentsCount: completedPayments.length,
                    pendingPaymentsCount: pendingPayments.length,
                    totalPaymentsCount: project._count.payments
                }
            };
        });

        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json({
            projects: projectsWithPaymentSummary,
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
        console.error('Error fetching projects with incomplete payments:', error);
        return NextResponse.json({ error: "Failed to fetch projects with incomplete payments" }, { status: 500 });
    }
}

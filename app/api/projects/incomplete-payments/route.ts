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

        // Find projects where total payments made is not equal to project budget
        const [projects, totalCount] = await Promise.all([
            prisma.project.findMany({
                where: {
                    clerkId: userId,
                    // Remove status filter - we want all projects regardless of status
                    // Remove payments filter - we'll calculate this in the application logic
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
                    // Remove status filter - we want all projects regardless of status
                }
            })
        ]);

        // Calculate payment summary for each project and filter incomplete ones
        const projectsWithPaymentSummary = projects
            .map(project => {
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
            })
            .filter(project => {
                // Only include projects where total payments made is not equal to project budget
                // This includes projects with no budget set (budget = 0) but has payments
                // Or projects where totalPaid != totalBudget
                const { totalBudget, totalPaid } = project.paymentSummary;
                
                // If budget is 0 or null, but there are payments, it's incomplete
                if (totalBudget === 0 && totalPaid > 0) {
                    return true;
                }
                
                // If budget is set, check if payments don't equal budget
                if (totalBudget > 0 && totalPaid !== totalBudget) {
                    return true;
                }
                
                return false;
            });

        // Apply pagination to filtered results
        const filteredProjects = projectsWithPaymentSummary.slice(skip, skip + limit);
        const filteredTotalCount = projectsWithPaymentSummary.length;
        const totalPages = Math.ceil(filteredTotalCount / limit);

        return NextResponse.json({
            projects: filteredProjects,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount: filteredTotalCount,
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

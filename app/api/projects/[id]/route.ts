import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { 
        id,
        clerkId: userId // Ensure user can only access their own projects
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true
          }
        },
        payments: {
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
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Calculate payment summary
    const totalBudget = project.budget ? Number(project.budget) : 0;
    const completedPayments = project.payments.filter(p => p.status === 'COMPLETED');
    const pendingPayments = project.payments.filter(p => p.status !== 'COMPLETED');
    
    const totalPaid = completedPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const totalPending = pendingPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const paymentCompletionPercentage = totalBudget > 0 ? (totalPaid / totalBudget) * 100 : 0;
    
    // Determine if payments are incomplete
    const isPaymentIncomplete = totalBudget > 0 && totalPaid !== totalBudget;

    const projectWithPaymentSummary = {
      ...project,
      paymentSummary: {
        totalBudget,
        totalPaid,
        totalPending,
        paymentCompletionPercentage: Math.round(paymentCompletionPercentage),
        completedPaymentsCount: completedPayments.length,
        pendingPaymentsCount: pendingPayments.length,
        totalPaymentsCount: project._count.payments,
        isPaymentIncomplete
      }
    };

    return NextResponse.json(projectWithPaymentSummary);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, status, priority, budget, startDate, endDate } = body;

    const project = await prisma.project.update({
      where: { id },
      data: {
        name,
        description: description || null,
        status,
        priority,
        budget: budget ? parseFloat(budget) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      }
    });

    return NextResponse.json(project);
  } catch {
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Delete the project
    await prisma.project.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { getPendingPaymentsByProject, getProjectPaymentStats } from '@/lib/payment-utils';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'stats') {
      const stats = await getProjectPaymentStats(params.id);
      if (!stats) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(stats);
    }

    const paymentSummary = await getPendingPaymentsByProject(params.id);
    if (!paymentSummary) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(paymentSummary);
  } catch (error) {
    console.error('Error fetching project payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project payments' },
      { status: 500 }
    );
  }
}
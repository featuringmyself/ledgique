import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock data - replace with actual calculation
    const change = "+15.2%";
    return NextResponse.json(change);
  } catch (error) {
    console.error('Error fetching client change:', error);
    return NextResponse.json("0.00%", { status: 200 });
  }
}
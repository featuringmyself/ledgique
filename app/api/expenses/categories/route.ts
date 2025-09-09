import { NextResponse } from 'next/server';

export async function GET() {
  const categories = [
    { value: 'OFFICE_SUPPLIES', label: 'Office Supplies' },
    { value: 'TRAVEL', label: 'Travel' },
    { value: 'MEALS', label: 'Meals' },
    { value: 'SOFTWARE', label: 'Software' },
    { value: 'EQUIPMENT', label: 'Equipment' },
    { value: 'MARKETING', label: 'Marketing' },
    { value: 'UTILITIES', label: 'Utilities' },
    { value: 'RENT', label: 'Rent' },
    { value: 'OTHER', label: 'Other' }
  ];

  return NextResponse.json(categories);
}
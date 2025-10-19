import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userCurrency = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
      select: {
        currency: true,
      },
    });
    return NextResponse.json(
      { currency: userCurrency?.currency || "" }, // Return the string or empty string if null
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching currency:", error);
    return NextResponse.json(
      { error: "Failed to fetch currency" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {currency} = body;

    if(!currency || typeof currency !=='string'){
        return NextResponse.json(
            { error: 'Invalid currency' },
            { status: 400 }
          );
    }

    const updatedUser = await prisma.user.upsert({
        where: {clerkId: userId},
        update: {currency},
        create: {
            clerkId: userId,
            currency
        },
        
        
    })
    return NextResponse.json(
        { 
          success: true,
          currency: updatedUser.currency 
        },
        { status: 200 }
      );
  } catch (error) {
    console.error('Error saving currency:', error);
    return NextResponse.json(
      { error: 'Failed to save currency' },
      { status: 500 }
    );
  }
}

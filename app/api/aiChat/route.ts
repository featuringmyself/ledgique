import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({});

export async function POST(req: NextRequest){
    const body = await req.json();
    const {message} = body;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents:  message,
    });
    console.log(response.text);

    return NextResponse.json({message: response.text})
}
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(Array.isArray(products) ? products : []);
  } catch (error) {
    console.error("Products API Error:", error);
    return NextResponse.json([]); // Return empty array to prevent frontend crash
  }
}

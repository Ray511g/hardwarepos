import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await prisma.product.findMany({
      orderBy: { category: 'asc' }
    });
    return NextResponse.json(Array.isArray(items) ? items : []);
  } catch (error) {
    console.error("Inventory API Error:", error);
    return NextResponse.json([]); // Return empty array to prevent frontend crash
  }
}

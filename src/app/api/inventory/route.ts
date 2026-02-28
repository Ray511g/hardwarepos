import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await prisma.product.findMany({
      orderBy: { category: 'asc' }
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}

import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { category, description, amount, date } = body;

    const expense = await prisma.expense.create({
      data: {
        category,
        description,
        amount,
        date: date ? new Date(date) : new Date(),
      }
    });

    return NextResponse.json({ success: true, expense });
  } catch (error) {
    console.error("Expense Error:", error);
    return NextResponse.json({ success: false, error: "Recording expense failed" }, { status: 500 });
  }
}

export async function GET() {
   try {
      const expenses = await prisma.expense.findMany({
         orderBy: { date: 'desc' }
      });
      return NextResponse.json(expenses);
   } catch (error) {
      return NextResponse.json([]);
   }
}
